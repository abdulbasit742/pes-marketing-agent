function integer(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

function secret(env, name, minimum) {
  const value = String(env[name] ?? '');
  if (value.length < minimum) throw new Error(`${name} must be at least ${minimum} characters`);
  return value;
}

export function loadConfig(env = process.env) {
  const operatorToken = secret(env, 'MARKETING_OPERATOR_TOKEN', 24);
  const sessionSecret = secret(env, 'MARKETING_SESSION_SECRET', 32);
  const anthropicKey = String(env.ANTHROPIC_API_KEY ?? '');
  const anthropicModel = String(env.ANTHROPIC_MODEL ?? '').trim();
  if (Boolean(anthropicKey) !== Boolean(anthropicModel)) {
    throw new Error('ANTHROPIC_API_KEY and ANTHROPIC_MODEL must be configured together');
  }
  const demoMode = env.MARKETING_DEMO_MODE === 'true';
  if (!anthropicKey && !demoMode) {
    throw new Error('Configure Anthropic or explicitly enable MARKETING_DEMO_MODE=true');
  }
  return Object.freeze({
    operatorToken,
    sessionSecret,
    anthropicKey,
    anthropicModel,
    demoMode,
    port: integer(env.PORT, 3000, 1, 65535),
    timeoutMs: integer(env.MARKETING_TIMEOUT_MS, 20000, 1000, 60000),
    sessionSeconds: integer(env.MARKETING_SESSION_HOURS, 8, 1, 24) * 3600,
    maxRequests: integer(env.MARKETING_MAX_REQUESTS, 20, 1, 100),
    production: env.NODE_ENV === 'production',
  });
}
