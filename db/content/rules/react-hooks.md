---
slug: react-hooks
name: React Hooks Rules
description: Enforce correct usage of React hooks — no conditional calls, exhaustive deps, and stable references.
tags:
  - react
  - hooks
agents:
  - cursor
  - copilot
installs: 41000
audit: pending
author: vercel-labs
createdAt: 2026-05-15
appliesTo:
  - "client/**/*.tsx"
  - "client/**/*.ts"
---

## React Hooks Rules

### No conditional hooks

Hooks must be called unconditionally at the top level of a component or custom hook.

### Exhaustive deps

Every value referenced inside `useEffect`, `useCallback`, or `useMemo` must appear in the dependency array. Add a `// NOTE:` comment when deliberately omitting a dep.

### Stable references

Wrap callbacks passed to child components in `useCallback` to prevent unnecessary re-renders.
