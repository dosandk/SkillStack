---
slug: frontend-design
name: Frontend Design
description: Apply consistent visual design principles when building or refining UI components.
tags:
  - design
  - ui
  - frontend
agents:
  - cursor
  - copilot
installs: 28000
audit: none
author: vercel-labs
createdAt: 2026-06-20
install: npx skillstack add vercel-labs/frontend-design
---

## Frontend Design

Provides the agent with a set of design principles to follow whenever building or modifying UI.

### Principles

- **Spacing** — use the design-system spacing scale; never hardcode px values.
- **Typography** — stick to the type scale; no ad-hoc font sizes.
- **Color** — use semantic tokens (`primary`, `error`, `text.secondary`), not raw hex.
- **Responsiveness** — mobile-first; test at `xs`, `sm`, and `md` breakpoints.
