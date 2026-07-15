import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = ['server.mjs', 'src', 'public', 'tests'];
const skipped = new Set(['node_modules', '.git']);
const files = [];
function walk(relative) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) return;
  const stat = fs.statSync(absolute);
  if (stat.isFile()) return files.push(relative.split(path.sep).join('/'));
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    if (entry.isDirectory() && skipped.has(entry.name)) continue;
    walk(path.join(relative, entry.name));
  }
}
paths.forEach(walk);
const findings = [];
const secretShapes = [/\bsk-[A-Za-z0-9_-]{20,}\b/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\bgh[pousr]_[A-Za-z0-9]{30,}\b/];
for (const file of files) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  if (file.startsWith('public/') && /api\.anthropic\.com|x-api-key|ANTHROPIC_API_KEY/.test(text)) findings.push(`${file}: provider credentials/endpoints must stay server-side`);
  if (/localStorage|sessionStorage/.test(text)) findings.push(`${file}: hidden browser persistence is not allowed`);
  if (/\b(?:publish|sendEmail|schedulePost|buyAds)\s*\(/.test(text)) findings.push(`${file}: external marketing side effect found`);
  if (/dangerouslySetInnerHTML|innerHTML\s*=|\beval\s*\(|new\s+Function/.test(text)) findings.push(`${file}: unsafe rendering or dynamic code found`);
  for (const shape of secretShapes) if (shape.test(text)) findings.push(`${file}: credential-shaped value found`);
}
const server = fs.readFileSync(path.join(root, 'server.mjs'), 'utf8');
for (const required of ["frame-ancestors 'none'", "connect-src 'self'", 'rate_limited', "server.listen(config.port, '127.0.0.1'"]) if (!server.includes(required)) findings.push(`server.mjs: missing boundary ${required}`);
const auth = fs.readFileSync(path.join(root, 'src/auth.mjs'), 'utf8');
for (const required of ['HttpOnly', 'SameSite=Strict', 'timingSafeEqual']) if (!auth.includes(required)) findings.push(`src/auth.mjs: missing session boundary ${required}`);
const policy = fs.readFileSync(path.join(root, 'src/policy.mjs'), 'utf8');
const service = fs.readFileSync(path.join(root, 'src/service.mjs'), 'utf8');
for (const required of ['draft_requires_human_review', 'Human review checklist', 'Remove credentials or secrets']) if (!policy.includes(required) && !service.includes(required)) findings.push(`draft boundary missing: ${required}`);
if (findings.length) { console.error(`Security check failed with ${findings.length} finding(s):`); findings.forEach((item) => console.error(`- ${item}`)); process.exit(1); }
console.log(`Security check passed for ${files.length} active files.`);
