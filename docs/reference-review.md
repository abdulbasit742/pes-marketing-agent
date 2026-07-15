# Reference review

Reviewed on 2026-07-15 before replacing the loose browser-only prototype.

## Postiz

Adopted: marketing content and social publishing are separate product capabilities; platform access belongs behind authenticated, approved integrations rather than pasted keys or direct browser calls.

Not adopted: social OAuth integrations, scheduling, analytics, leads, collaboration, or automation APIs.

## Mautic

Adopted: privacy and operator-owned deployment are first-class marketing-automation boundaries, and development source should not be described as automatically production-ready.

Not adopted: contacts database, segmentation, campaigns, email delivery, tracking, plugins, or a PHP/runtime migration.

## n8n

Adopted: credentials and side-effecting actions must be explicit server-owned workflow steps with visible execution boundaries. AI output is data to review, not authorization to act.

Not adopted: workflow engine, arbitrary connectors, credential store, queues, code execution, or autonomous publishing.

## Result

The repository is now an authenticated drafting console rather than an autonomous marketing system. It keeps the provider credential server-side, bounds input/output/time/rate state, clearly labels demo mode, returns `draft_requires_human_review`, and deliberately has no posting, email, ad-spend, analytics, contact-list, or scheduling integration.
