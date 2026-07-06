---
slug: systematic-debugging
name: Systematic Debugging
description: Step-by-step protocol for isolating and fixing bugs without guessing.
tags:
  - debugging
  - workflow
agents:
  - cursor
  - claude-code
installs: 38000
audit: pending
author: obra
createdAt: 2026-05-01
install: npx skillstack add obra/systematic-debugging
---

## Systematic Debugging

Forces the agent to gather evidence before proposing a fix, reducing hallucinated root causes.

### Protocol

1. Reproduce the bug with a minimal case.
2. State the hypothesis — one cause at a time.
3. Add a probe (log / assertion) to confirm or refute.
4. Fix only after the root cause is confirmed.

### Rules

- Never skip step 2 and go straight to a fix.
- One hypothesis per iteration.
