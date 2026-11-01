---
name: architecture-rules
description: >-
  SkillStack architecture rules distilled from the ADRs: backend layers, the
  shared gateway, Firestore ownership, the skill data model, ELEKS UI imports,
  path aliases and backward compatibility. Use when designing, implementing or
  reviewing changes in client, functions, shared or cli.
---

# Architecture rules

Source: `wiki/architectural-decision-records/` (index in `index.md`). These
rules are the checklist; read the full ADR for every area you design, change
or review.

- **Backend layers (ADR-003).** Handler `functions/src/functions/*/index.ts`:
  parse the request, call one domain function, map results and errors to
  status codes. Domain `function.ts`: business rules and Zod validation,
  nothing about HTTP or Firestore. Store
  `functions/src/services/repositories-store.ts`: the only Firestore access.
- **Entry points.** Every `apiXxx` handler is exported from
  `functions/src/index.ts`, after `admin.initializeApp()`; never import a
  handler above that call.
- **Gateway (ADR-004).** `client/` and `cli/` reach the backend and GitHub
  only through `backendService` and `githubService` from `@shared`, never
  with their own `fetch`. A new endpoint needs its `functions/src/index.ts`
  export and a `backendService` method before a consumer can use it.
- **Firestore owner (ADR-005).** Only `functions/` reads or writes Firestore,
  and it re-validates every input. `functions/` imports nothing from `shared/`
  and calls no third-party API.
- **Zod (ADR-006).** Zod validates at the domain boundary and defines
  persisted document shapes; infer types from the schemas instead of
  duplicating them.
- **Skill data model (ADR-007).** A `repositories` document holds metadata and
  a `skills[]` array; each skill is also a document in its `skills`
  subcollection with an `installCount`. Every write to a skill keeps both
  copies consistent, and writes that must succeed together use a transaction
  or a batch. Existing documents must still parse under a changed schema, or
  the change needs a migration or backfill.
- **ELEKS UI (ADR-008).** Import only through `@eleks-ui/components` and
  `@eleks-ui/theme`, never by a relative path into
  `client/src/components/eleks-ui/`; prefer the vendored wrappers to raw MUI.
- **CLI (ADR-009).** Commander and tsup; files are written only under
  `.agents/`, with no path traversal outside it.
- **Path aliases.** A new or renamed alias goes in `tsconfig.base.json`,
  `vite.config.ts`, `vitest.config.ts` and `cli/tsup.config.ts`.
- **Compatibility.** Installed CLI versions keep calling the deployed API:
  changes to existing endpoints and to `backendService` stay backward
  compatible unless the spec says otherwise. Deploy `functions/` before client
  and CLI releases.
- **Protected files.** `.env*`, `firebase.json`, `.firebaserc`, Firestore rules
  and indexes change only when the plan names them. Add a dependency with
  `npm install <pkg>` in the package that owns it (the root for `client/`);
  never edit a lockfile by hand.
