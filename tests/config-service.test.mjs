import assert from 'node:assert/strict';
import test from 'node:test';
import { loadConfig } from '../src/config.mjs';
import { createMarketingDraft } from '../src/service.mjs';

const base = { MARKETING_OPERATOR_TOKEN: 'o'.repeat(24), MARKETING_SESSION_SECRET: 's'.repeat(32), MARKETING_DEMO_MODE: 'true' };
test('configuration fails without operator secrets', () => assert.throws(() => loadConfig({ MARKETING_DEMO_MODE: 'true' }), /OPERATOR/));
test('provider key and model must be paired', () => assert.throws(() => loadConfig({ ...base, ANTHROPIC_API_KEY: 'key' }), /together/));
test('explicit demo mode produces a no-side-effect result', async () => { const result = await createMarketingDraft({ mode: 'ideas', audience: 'Student founders', objective: 'Collect workshop ideas', brief: 'Suggest a campaign outline using only facts supplied by the organizer.' }, loadConfig(base)); assert.equal(result.provider, 'demo'); assert.equal(result.status, 'draft_requires_human_review'); assert.equal(result.sideEffects, 'none'); });
