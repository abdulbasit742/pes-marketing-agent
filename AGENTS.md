# AGENTS.md

## Scope

These instructions apply to the entire `abdulbasit742/pes-marketing-agent` repository.

Project: a dependency-free, authenticated, **draft-only** marketing assistant.

## Trust boundary

- `server.mjs`: same-origin HTTP boundary, session enforcement, body/rate limits, static assets
- `src/auth.mjs`: signed HttpOnly operator session
- `src/config.mjs`: fail-closed environment configuration
- `src/policy.mjs`: mode/input/secret validation and review prompt
- `src/provider.mjs`: fixed server-side provider call with timeout/response bounds
- `src/service.mjs`: draft-only orchestration result
- `public/`: untrusted browser UI; no secrets, provider endpoints, storage, or publishing actions

## Verified commands

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run check
```

## Rules

1. Keep provider and operator credentials server-side and out of URLs, logs, browser storage, and responses.
2. Preserve explicit operator authentication, same-origin mutation checks, bounded fields/body/rate state, and plain-text output.
3. Model output must remain a draft requiring human review.
4. Do not add publishing, email delivery, scheduling, ads, contact imports, scraping, analytics claims, or external mutations without a separate reviewed authorization/consent/audit design.
5. Keep demo mode explicit and clearly labelled; never disguise deterministic output as AI.
6. Do not make uptime, cost, capacity, conversion, ROI, or factual marketing claims without evidence.
7. Update tests, scanner, README, reference review, and audit whenever the trust boundary changes.
