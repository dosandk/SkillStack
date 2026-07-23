---
description: Code comment conventions — English only, NOTE prefix, no how-it-works, nuances and issue links only
alwaysApply: true
---

# Code comments

Code must be self-explanatory. Comments are for exceptions, not narration.

## Language

Every comment must be written in English — `//`, `/* */`, and doc comments alike.

```ts
// ❌ BAD — non-English comment
// перевіряємо посилання

// ✅ GOOD
// NOTE: supported formats — full URL, .../tree/<branch>, short owner/repo
```

## When to comment

Add a comment only when:

- A **non-trivial nuance** is easy to miss (workaround, ordering constraint, browser quirk, side effect).
- A **tracked upstream issue** explains why the code exists — link the issue URL.

Do **not** comment on what or how the code works. If that needs explanation, rename or refactor instead.

## Format

Every comment starts with `NOTE:` (line, block, or doc comment):

```ts
// NOTE: focus trap breaks if Dialog mounts before theme provider — keep order in App.tsx

/* NOTE: batch size capped at 50 — API returns 413 above that */

/**
 * NOTE: https://github.com/mui/material-ui/issues/35287 — remove when on v6.1+
 */
```

## Examples

```ts
// ❌ BAD — describes implementation
// loops through items and filters by status
// calls setState with the new value

// ❌ BAD — missing NOTE prefix
// React 18 strict mode double-mounts effects here

// ✅ GOOD — non-trivial nuance
// NOTE: React 18 strict mode double-mounts effects here; guard with ref

// ✅ GOOD — upstream issue
// NOTE: https://github.com/vitejs/vite/issues/1234 — delete after Vite 6 upgrade
```

## Rules

- Prefer no comment over a redundant one.
- One `NOTE:` per comment; keep it to one or two sentences.
- Issue links must be full URLs to an existing issue in the relevant library repo.
- Comments are in English (see Language above).
