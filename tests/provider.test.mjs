import assert from 'node:assert/strict';
import test from 'node:test';
import { callAnthropic, ProviderError } from '../src/provider.mjs';

const input = { apiKey: 'server-key', model: 'approved-model', system: 'Draft only.', request: { brief: 'x' }, timeoutMs: 1000 };
test('provider uses fixed endpoint and server header', async () => { let captured; const text = await callAnthropic({ ...input, fetchImpl: async (url, options) => { captured = { url, options }; return { ok: true, status: 200, text: async () => JSON.stringify({ content: [{ type: 'text', text: 'review me' }] }) }; } }); assert.equal(text, 'review me'); assert.equal(captured.url, 'https://api.anthropic.com/v1/messages'); assert.equal(captured.options.headers['x-api-key'], 'server-key'); });
test('invalid JSON fails closed', async () => { await assert.rejects(callAnthropic({ ...input, fetchImpl: async () => ({ ok: true, status: 200, text: async () => 'nope' }) }), (error) => error instanceof ProviderError && error.code === 'invalid_provider_response'); });
test('rate limits are normalized without leaking payloads', async () => { await assert.rejects(callAnthropic({ ...input, fetchImpl: async () => ({ ok: false, status: 429, text: async () => '{}' }) }), (error) => error.code === 'rate_limited' && error.status === 503); });
