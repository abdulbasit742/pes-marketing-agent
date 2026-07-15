(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const loginView = $('#login-view');
  const workspace = $('#workspace');
  const logout = $('#logout');
  const draft = $('#draft');
  const reviewed = $('#reviewed');
  const copy = $('#copy');
  const download = $('#download');
  let currentDraft = '';

  async function request(path, options = {}) {
    const response = await fetch(path, { credentials: 'same-origin', ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error?.message || 'Request failed.');
    return data;
  }

  function authenticated(value) {
    loginView.hidden = value;
    workspace.hidden = !value;
    logout.hidden = !value;
    if (value) $('#token').value = '';
  }

  request('/api/session').then(() => authenticated(true)).catch(() => authenticated(false));
  request('/api/status').then((data) => { $('#status').textContent = `${data.provider === 'demo' ? 'Explicit demo mode' : 'Anthropic provider'} • publishing disabled`; }).catch(() => { $('#status').textContent = 'Status unavailable'; });

  $('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); $('#login-error').textContent = '';
    try { await request('/api/login', { method: 'POST', body: JSON.stringify({ token: $('#token').value }) }); authenticated(true); }
    catch (error) { $('#login-error').textContent = error.message; }
  });

  logout.addEventListener('click', async () => { try { await request('/api/logout', { method: 'POST', body: '{}' }); } finally { authenticated(false); currentDraft = ''; draft.textContent = 'No draft generated yet.'; } });

  $('#draft-form').addEventListener('submit', async (event) => {
    event.preventDefault(); $('#form-error').textContent = ''; $('#generate').disabled = true; reviewed.checked = false; reviewed.disabled = true; copy.disabled = true; download.disabled = true; draft.textContent = 'Preparing draft…';
    try {
      const data = await request('/api/draft', { method: 'POST', body: JSON.stringify({ mode: $('#mode').value, audience: $('#audience').value, objective: $('#objective').value, brief: $('#brief').value, constraints: $('#constraints').value }) });
      currentDraft = data.draft; draft.textContent = data.draft; $('#provider').textContent = data.provider; reviewed.disabled = false;
    } catch (error) { currentDraft = ''; draft.textContent = 'No draft available.'; $('#form-error').textContent = error.message; }
    finally { $('#generate').disabled = false; }
  });

  reviewed.addEventListener('change', () => { const enabled = reviewed.checked && Boolean(currentDraft); copy.disabled = !enabled; download.disabled = !enabled; });
  copy.addEventListener('click', async () => { await navigator.clipboard.writeText(currentDraft); copy.textContent = 'Copied'; setTimeout(() => { copy.textContent = 'Copy reviewed draft'; }, 1500); });
  download.addEventListener('click', () => { const url = URL.createObjectURL(new Blob([currentDraft], { type: 'text/plain' })); const link = document.createElement('a'); link.href = url; link.download = 'pes-marketing-draft.txt'; link.click(); URL.revokeObjectURL(url); });
})();
