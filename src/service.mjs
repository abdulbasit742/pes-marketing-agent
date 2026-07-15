import { randomUUID } from 'node:crypto';
import { buildSystemPrompt, deterministicDraft, validateDraftRequest } from './policy.mjs';
import { callAnthropic } from './provider.mjs';

export async function createMarketingDraft(payload, config, dependencies = {}) {
  const request = validateDraftRequest(payload);
  const started = Date.now();
  let provider;
  let draft;
  if (config.anthropicKey) {
    provider = 'anthropic';
    draft = await callAnthropic({
      apiKey: config.anthropicKey,
      model: config.anthropicModel,
      system: buildSystemPrompt(request),
      request,
      timeoutMs: config.timeoutMs,
      fetchImpl: dependencies.fetchImpl,
      signal: dependencies.signal,
    });
  } else {
    provider = 'demo';
    draft = deterministicDraft(request);
  }
  return Object.freeze({
    requestId: randomUUID(),
    status: 'draft_requires_human_review',
    provider,
    mode: request.mode,
    draft,
    durationMs: Date.now() - started,
    sideEffects: 'none',
  });
}
