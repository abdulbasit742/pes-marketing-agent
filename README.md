# PES Marketing Draft Studio

A dependency-free, authenticated marketing drafting console for the Pakistan Entrepreneurship Society. It prepares reviewable text; it does **not** publish posts, send email, schedule campaigns, purchase ads, contact people, or claim analytics results.

The original repository contained loose deployment instructions and a browser component that called a provider directly. The maintained application now uses normal source files and a server-owned trust boundary.

## Local setup

Requirements: Node.js 20 or newer.

```bash
cp .env.example .env
# Fill MARKETING_OPERATOR_TOKEN and MARKETING_SESSION_SECRET.
# Configure Anthropic, or explicitly set MARKETING_DEMO_MODE=true.
set -a && . ./.env && set +a
npm start
```

Open `http://127.0.0.1:3000`. The server intentionally binds to loopback. Put it behind an authenticated HTTPS reverse proxy only after reviewing the deployment and rate-limit model.

## Configuration

Required:

- `MARKETING_OPERATOR_TOKEN`: at least 24 characters
- `MARKETING_SESSION_SECRET`: independent value of at least 32 characters

Provider option:

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`

Both provider values must be configured together. No default model or cost claim is assumed. For a deterministic non-AI smoke test, set `MARKETING_DEMO_MODE=true`; the response is visibly labelled.

## Workflow

1. An operator signs in; the token is exchanged for an HttpOnly session cookie and is not stored in browser storage.
2. The operator supplies an audience, objective, verified brief, and constraints.
3. The server validates and bounds the request, blocks credential-shaped content, and calls the configured provider or explicit demo fallback.
4. The result is labelled `draft_requires_human_review` and has no side effects.
5. Copy/download remains disabled until the operator confirms factual, consent, brand, platform, link, and accessibility review.
6. Any real publishing or delivery happens separately through an authorized human-controlled system.

## Verification

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run check
```

The regression suite covers configuration, signed-session expiry/tampering, field and secret validation, deterministic demo behavior, fixed provider routing, provider failure normalization, and the source security contract.

## Deployment boundary

This is a small single-operator baseline. Before internet exposure, add a real identity provider, roles, distributed rate limiting, privacy-aware logs, CSRF review behind the chosen proxy, monitoring, backups, and provider-retention review. Never expose the operator token or provider key to client JavaScript.

## Documentation

- [Reference review](docs/reference-review.md)
- [Security audit](docs/security-audit.md)
