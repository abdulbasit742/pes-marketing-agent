export class ProviderError extends Error {
  constructor(message, code = 'provider_error', status = 502) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function callAnthropic({ apiKey, model, system, request, timeoutMs, fetchImpl = globalThis.fetch, signal }) {
  const controller = new AbortController();
  const forwardAbort = () => controller.abort(signal?.reason);
  if (signal?.aborted) controller.abort(signal.reason);
  else signal?.addEventListener('abort', forwardAbort, { once: true });
  const timeout = setTimeout(() => controller.abort(new Error('provider timeout')), timeoutMs);
  try {
    const response = await fetchImpl('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model,
        max_tokens: 1600,
        system,
        messages: [{ role: 'user', content: JSON.stringify(request) }],
      }),
      signal: controller.signal,
    });
    const text = await response.text();
    if (text.length > 1_000_000) throw new ProviderError('Provider response exceeded the size limit', 'response_too_large');
    let data;
    try { data = JSON.parse(text); } catch { throw new ProviderError('Provider returned invalid JSON', 'invalid_provider_response'); }
    if (!response.ok) throw new ProviderError(response.status === 429 ? 'Provider is rate limited' : 'Provider request failed', response.status === 429 ? 'rate_limited' : 'provider_http_error', response.status === 429 ? 503 : 502);
    const output = data?.content?.find?.((item) => item?.type === 'text')?.text;
    if (typeof output !== 'string' || !output.trim()) throw new ProviderError('Provider returned no usable draft', 'invalid_provider_response');
    return output.trim().slice(0, 20000);
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    if (controller.signal.aborted) throw new ProviderError('Provider request timed out or was cancelled', 'provider_timeout', 504);
    throw new ProviderError('Provider network request failed', 'provider_network_error');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener?.('abort', forwardAbort);
  }
}
