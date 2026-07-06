---
slug: no-any
name: No Any
description: Forbid the use of the `any` type in TypeScript app code; use unknown or a concrete type instead.
tags:
  - typescript
  - types
agents:
  - cursor
  - claude-code
  - codex
installs: 67000
audit: audited
author: eleks
createdAt: 2026-02-05
appliesTo:
  - "**/*.ts"
  - "**/*.tsx"
---

## No Any

Prohibits `any` in TypeScript source files. Allowed alternatives:

- `unknown` — when the type truly cannot be known; add a type guard before use.
- A concrete union type — when the set of possibilities is finite.
- A generic type parameter — when the caller should decide the type.

Exceptions (comment `// eslint-disable-next-line @typescript-eslint/no-explicit-any`):
- Third-party library internals that export `any`.
- Auto-generated code outside the repo.
