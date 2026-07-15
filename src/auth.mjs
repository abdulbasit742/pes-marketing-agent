import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const COOKIE_NAME = 'pes_marketing_session';

function encode(value) {
  return Buffer.from(value).toString('base64url');
}

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function constantTimeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createSession(secret, lifetimeSeconds, now = Date.now()) {
  const payload = JSON.stringify({
    v: 1,
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + lifetimeSeconds,
    nonce: randomBytes(16).toString('hex'),
  });
  const body = encode(payload);
  return `${body}.${sign(body, secret)}`;
}

export function verifySession(token, secret, now = Date.now()) {
  if (typeof token !== 'string') return null;
  const [body, signature, extra] = token.split('.');
  if (!body || !signature || extra || !constantTimeEqual(signature, sign(body, secret))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    const current = Math.floor(now / 1000);
    if (payload.v !== 1 || !Number.isInteger(payload.iat) || !Number.isInteger(payload.exp)) return null;
    if (payload.iat > current + 60 || payload.exp <= current || payload.exp - payload.iat > 86400) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(header = '') {
  return Object.fromEntries(String(header).split(';').map((part) => part.trim()).filter(Boolean).map((part) => {
    const index = part.indexOf('=');
    return index < 0 ? [part, ''] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }));
}

export function sessionCookie(token, maxAge, secure = false) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

export function clearSessionCookie(secure = false) {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`;
}
