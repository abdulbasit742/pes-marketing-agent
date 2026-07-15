# Changed-area security and claims audit

## Removed active risks

- direct browser request to Anthropic without a server credential boundary
- unsupported claims of unlimited users, free-forever hosting, instant production readiness, autonomous operation, and guaranteed 24/7 service
- no operator authentication or request-rate boundary
- unbounded prompt/provider response handling
- model output presented without a review state
- vague deployment instructions that omitted secret and abuse controls

## Current controls

- operator token exchanged for an HMAC-signed HttpOnly, SameSite=Strict session cookie
- exact same-origin checks for mutations and loopback-only default binding
- fixed Anthropic endpoint, server-only key/model, 1–60 second timeout, and 1 MB response cap
- 32 KB request body and bounded marketing fields
- credential-shaped prompt rejection
- capped 10-minute per-session request buckets and capped principal map
- plain-text rendering, restrictive CSP, no browser storage, and no hidden conversation persistence
- explicit demo mode when no paid provider is configured
- every result reports `draft_requires_human_review` and `sideEffects: none`
- copy/download controls remain disabled until the operator confirms review
- dependency-free tests, source scanner, and Node 20/22 CI

## Residual risks

- a shared deployment still has one operator identity rather than multi-user accounts and roles
- in-memory rate limits reset on restart and do not coordinate across multiple instances
- prompt-injection and secret detection are heuristic; operators must review supplied material
- provider data handling is governed by the configured provider and hosting environment
- model output can be inaccurate, biased, non-compliant, or unsuitable despite the review checklist
- the project does not provide campaign delivery, consent management, unsubscribe handling, analytics, or audit-grade publication logs

Do not add external publishing or messaging until authentication, role authorization, recipient consent, platform policy, explicit per-action approval, idempotency, and durable audit logging are designed and tested.
