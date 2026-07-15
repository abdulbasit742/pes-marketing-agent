import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COOKIE_NAME, clearSessionCookie, constantTimeEqual, createSession, parseCookies, sessionCookie, verifySession } from './src/auth.mjs';
import { loadConfig } from './src/config.mjs';
import { ProviderError } from './src/provider.mjs';
import { createMarketingDraft } from './src/service.mjs';

const config = loadConfig();
const publicRoot = resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
const buckets = new Map();

function headers(extra = {}) {
  return {
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'same-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    'content-security-policy': "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    ...extra,
  };
}

function json(res, status, value, extra = {}) {
  res.writeHead(status, headers({ 'content-type': 'application/json; charset=utf-8', ...extra }));
  res.end(JSON.stringify(value));
}

async function body(req, limit = 32768) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Request body is too large'), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
  catch { throw Object.assign(new Error('Request body must be valid JSON'), { status: 400 }); }
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return !config.production && !origin;
  try {
    const url = new URL(origin);
    return url.host === host && (config.production ? url.protocol === 'https:' : ['http:', 'https:'].includes(url.protocol));
  } catch { return false; }
}

function session(req) {
  return verifySession(parseCookies(req.headers.cookie)[COOKIE_NAME], config.sessionSecret);
}

function allowRequest(principal) {
  const now = Date.now();
  for (const [key, item] of buckets) if (item.reset <= now) buckets.delete(key);
  if (buckets.size >= 256 && !buckets.has(principal)) return false;
  const item = buckets.get(principal) ?? { count: 0, reset: now + 10 * 60 * 1000 };
  item.count += 1;
  buckets.set(principal, item);
  return item.count <= config.maxRequests;
}

async function api(req, res, pathname) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !sameOrigin(req)) return json(res, 403, { error: { code: 'origin_denied', message: 'Request origin is not allowed.' } });
  if (pathname === '/api/status' && req.method === 'GET') return json(res, 200, { ready: true, provider: config.anthropicKey ? 'anthropic' : 'demo', publishing: false, sideEffects: false });
  if (pathname === '/api/login' && req.method === 'POST') {
    const payload = await body(req, 4096);
    if (!constantTimeEqual(payload.token, config.operatorToken)) return json(res, 401, { error: { code: 'invalid_credentials', message: 'Sign-in failed.' } });
    const token = createSession(config.sessionSecret, config.sessionSeconds);
    return json(res, 200, { authenticated: true }, { 'set-cookie': sessionCookie(token, config.sessionSeconds, config.production) });
  }
  if (pathname === '/api/logout' && req.method === 'POST') return json(res, 200, { authenticated: false }, { 'set-cookie': clearSessionCookie(config.production) });
  const current = session(req);
  if (pathname === '/api/session' && req.method === 'GET') return json(res, current ? 200 : 401, { authenticated: Boolean(current) });
  if (pathname === '/api/draft' && req.method === 'POST') {
    if (!current) return json(res, 401, { error: { code: 'authentication_required', message: 'Sign in to create a draft.' } });
    if (!allowRequest(current.nonce)) return json(res, 429, { error: { code: 'rate_limited', message: 'Draft limit reached. Try again later.' } });
    const payload = await body(req);
    const controller = new AbortController();
    req.on('close', () => controller.abort());
    const result = await createMarketingDraft(payload, config, { signal: controller.signal, fetchImpl: globalThis.fetch });
    return json(res, 200, result);
  }
  return json(res, 404, { error: { code: 'not_found', message: 'API route not found.' } });
}

async function serve(req, res, pathname) {
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const candidate = resolve(publicRoot, relative);
  if (!candidate.startsWith(`${publicRoot}/`) && candidate !== resolve(publicRoot, 'index.html')) return json(res, 404, { error: { code: 'not_found' } });
  try {
    const content = await readFile(candidate);
    res.writeHead(200, headers({ 'content-type': mime[extname(candidate)] ?? 'application/octet-stream' }));
    res.end(content);
  } catch {
    const content = await readFile(resolve(publicRoot, 'index.html'));
    res.writeHead(200, headers({ 'content-type': mime['.html'] }));
    res.end(content);
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) await api(req, res, url.pathname);
    else if (req.method === 'GET' || req.method === 'HEAD') await serve(req, res, url.pathname);
    else json(res, 405, { error: { code: 'method_not_allowed', message: 'Method not allowed.' } });
  } catch (error) {
    const status = error instanceof ProviderError ? error.status : error.status || (error instanceof TypeError || error instanceof RangeError ? 400 : 500);
    const code = error instanceof ProviderError ? error.code : status < 500 ? 'invalid_request' : 'internal_error';
    const message = status < 500 || error instanceof ProviderError ? error.message : 'The request could not be completed.';
    json(res, status, { error: { code, message } });
  }
});

server.listen(config.port, '127.0.0.1', () => console.log(`PES Marketing Agent listening on http://127.0.0.1:${config.port}`));
