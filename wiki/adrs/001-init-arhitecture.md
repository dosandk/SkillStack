# ADR 001: Initial architecture

- **Status:** Accepted
- **Date:** 2026-07-10

## Context

SkillStack is a catalog of AI engineering building blocks — skills

We need a web front end, an HTTP API, user authentication (GitHub), and a hosting/deploy story,
with the smallest amount of infrastructure.
We use **Firebase** for hosting, serverless APIs, and auth come from one managed platform with a
single local emulator suite.

## Decision

Build SkillStack as a **single-package monorepo on Firebase**, split by responsibility into two
deployable units:

| Alias  | Folder       | Responsibility                                                            |
| ------ | ------------ | ------------------------------------------------------------------------- |
| `[FE]` | `client/`    | React 19 + Vite front end (MUI via the in-repo `eleks-ui` component set). |
| `[BE]` | `functions/` | Firebase Cloud Functions — the HTTP API served under `/api/*`.            |

Supporting folders:

| Alias  | Folder  | Responsibility                                                                                    |
| ------ | ------- | ------------------------------------------------------------------------------------------------- |
| [CLI]  | `cli/`  | npm package `skillstack` CLI (`push` / `pull`) for syncing AI configs.                            |
| [WIKI] | `wiki/` | Documentation: ADRs (`wiki/adrs`), docs (`wiki/docs`), and the feature backlog (`wiki/features`). |

### Platform: Firebase

- **Hosting** serves the built client from `dist/` (`firebase.json` → `hosting.public`). A
  catch-all rewrite (`** → /index.html`) makes it a single-page app.
- **Cloud Functions** (`functions/`, Node 24, `firebase-functions` v2 `onRequest`) implement the
  API. The client calls relative `/api/*` paths; feature APIs (e.g. list/search skills) are each
  a Cloud Function.
- **Authentication** uses the **GitHub auth provider**. In development, `client/src/lib/firebase.ts`
  points the SDK at the local Auth emulator

Firebase web-config identifiers live in source (`client/src/lib/firebase.ts`) — they are public
by design; security comes from Firebase rules, authorized domains, and provider config.
