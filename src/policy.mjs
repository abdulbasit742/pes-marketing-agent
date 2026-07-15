export const MODES = Object.freeze({
  general: 'General marketing strategy',
  social: 'Social media draft',
  email: 'Email campaign draft',
  content: 'Content strategy',
  ads: 'Advertising copy draft',
  analysis: 'Market-analysis brief',
  ideas: 'Campaign concepts',
});

const MAX_FIELD = Object.freeze({ brief: 4000, audience: 500, objective: 500, constraints: 1000 });
const SENSITIVE = /\b(?:api[_ -]?key|secret|password|private[_ -]?key|bearer\s+[a-z0-9._-]+|sk-[a-z0-9_-]{12,})\b/i;

export function clean(value, maximum) {
  return String(value ?? '').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maximum);
}

export function validateDraftRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('JSON request body is required');
  const mode = clean(input.mode, 40).toLowerCase();
  if (!Object.hasOwn(MODES, mode)) throw new TypeError('mode is invalid');
  const brief = clean(input.brief, MAX_FIELD.brief);
  const audience = clean(input.audience, MAX_FIELD.audience);
  const objective = clean(input.objective, MAX_FIELD.objective);
  const constraints = clean(input.constraints, MAX_FIELD.constraints);
  if (brief.length < 10) throw new TypeError('brief must contain at least 10 characters');
  if (!audience) throw new TypeError('audience is required');
  if (!objective) throw new TypeError('objective is required');
  const combined = `${brief}\n${audience}\n${objective}\n${constraints}`;
  if (SENSITIVE.test(combined)) throw new TypeError('Remove credentials or secrets before requesting a draft');
  return Object.freeze({ mode, brief, audience, objective, constraints });
}

export function buildSystemPrompt(request) {
  return [
    `You are a drafting assistant for the Pakistan Entrepreneurship Society. Mode: ${MODES[request.mode]}.`,
    'Return a reviewable marketing draft, not a claim that anything was published, sent, scheduled, purchased, measured, or approved.',
    'Clearly label assumptions, suggested evidence checks, and any placeholder facts.',
    'Avoid fabricated statistics, testimonials, endorsements, urgency, guarantees, or competitor allegations.',
    'Do not request or expose credentials, private personal data, or mailing lists.',
    'Include a final section titled "Human review checklist" covering factual accuracy, audience consent, brand approval, platform policy, links, and accessibility.',
  ].join(' ');
}

export function deterministicDraft(request) {
  return [
    '[Demo mode — no model was called]',
    '',
    `Mode: ${MODES[request.mode]}`,
    `Audience: ${request.audience}`,
    `Objective: ${request.objective}`,
    '',
    'Draft outline:',
    `1. Opening: ${request.brief}`,
    '2. Value: explain the verified benefit in plain language.',
    '3. Evidence: insert only approved facts, dates, links, and named sources.',
    '4. Call to action: invite a voluntary next step without artificial urgency.',
    request.constraints ? `5. Constraints to honor: ${request.constraints}` : '5. Constraints: confirm brand, legal, and platform requirements.',
    '',
    'Human review checklist:',
    '- Verify every factual and numerical claim.',
    '- Confirm audience consent and channel rules.',
    '- Obtain brand/organizer approval.',
    '- Check links, alt text, readability, and accessibility.',
    '- Publish or send only through an authorized human-controlled tool.',
  ].join('\n');
}
