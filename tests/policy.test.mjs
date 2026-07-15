import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSystemPrompt, deterministicDraft, validateDraftRequest } from '../src/policy.mjs';

const valid = { mode: 'social', audience: 'PIEAS students', objective: 'Workshop registration', brief: 'Draft an informative Instagram caption for a verified entrepreneurship workshop.', constraints: 'No urgency claims.' };

test('accepts and normalizes a bounded draft request', () => { const result = validateDraftRequest(valid); assert.equal(result.mode, 'social'); assert.equal(result.audience, 'PIEAS students'); });
test('rejects unknown modes', () => assert.throws(() => validateDraftRequest({ ...valid, mode: 'publish-now' }), /mode/));
test('rejects short briefs', () => assert.throws(() => validateDraftRequest({ ...valid, brief: 'short' }), /10/));
test('rejects credential-shaped content', () => assert.throws(() => validateDraftRequest({ ...valid, brief: 'Use api key secret in this marketing request' }), /credentials/));
test('system prompt locks draft-only behavior', () => { const prompt = buildSystemPrompt(validateDraftRequest(valid)); assert.match(prompt, /not a claim that anything was published/); assert.match(prompt, /Human review checklist/); });
test('demo fallback is clearly labelled and review-first', () => { const output = deterministicDraft(validateDraftRequest(valid)); assert.match(output, /^\[Demo mode/); assert.match(output, /Human review checklist/); assert.match(output, /authorized human-controlled tool/); });
