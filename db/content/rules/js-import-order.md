---
slug: js-import-order
name: JS Import Order
description: Enforce a consistent import ordering in JavaScript and TypeScript files.
tags:
  - style
  - imports
agents:
  - cursor
  - claude-code
  - codex
  - copilot
installs: 85000
audit: audited
author: eleks
createdAt: 2026-01-20
appliesTo:
  - "**/*.ts"
  - "**/*.tsx"
---

## JS Import Order

Group imports in this order, separated by a blank line between groups:

1. Node built-ins (`node:fs`, `path`, ...)
2. External packages (`react`, `express`, ...)
3. Internal aliases (`@shared`, `@db`, `@eleks-ui/*`)
4. Relative imports (`./`, `../`)

Within a group, sort alphabetically. Type-only imports use `import type`.
