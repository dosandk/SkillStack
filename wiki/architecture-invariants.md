---
name: SkillStack Architecture Invariants
type: architecture-invariants
parent: wiki/architecture.md
status: final
created: 2026-07-19
updated: 2026-07-30
---

# Architecture Invariants — SkillStack

```mermaid
flowchart LR
    Client["client/ (web SPA)"] -->|"via shared/"| Shared["shared/\n(firebase-cloude-api)"]
    CLI["cli/ (npm package)"] -->|"via shared/"| Shared
    Shared -->|HTTP| Functions["functions/ (Cloud Functions)"]
    Functions -->|"discovery + content"| GitHub["GitHub API"]
    Functions -->|"validation"| Anthropic["Anthropic API"]
    Functions --> Firestore[("Firestore")]
```

<a id="ad-1"></a>

### AD-1 — Cloud Functions is the sole Firestore gateway

- **Binds:** all
- **Prevents:** `client/` or `cli/` reading/writing Firestore directly and independently drifting from the calculated/aggregate fields or the collection shape.
- **Rule:** Only `functions/src/services/*.ts` holds Firestore access (via `firebase-admin`). Neither `client/` nor `cli/` ever import a Firestore SDK.

<a id="ad-2"></a>

### AD-2 — Backend layering: thin adapter over a single-owner store

- **Binds:** functions/
- **Prevents:** HTTP concerns, business rules, and Firestore access bleeding into one undifferentiated file.
- **Rule:** `functions/src/functions/<verb>.ts` parses the request, calls exactly one `services/<noun>-store.ts` function, and maps the result/error to an HTTP response. `services/<noun>-store.ts` owns that collection's Zod schema and is the only place `.parse()`/Firestore calls for it happen.

<a id="ad-3"></a>

### AD-3 — `firestore.rules` is deny-all

- **Binds:** platform
- **Prevents:** owner-based rule logic that duplicates checks already done in `functions/` and can drift from them.
- **Rule:** Every collection's rule is `allow read, write: if false`. Firestore is reachable only through the admin SDK inside `functions/` (AD-1), so there is nothing for client-facing rules to arbitrate.

<a id="ad-4"></a>

### AD-4 — Client: router-owned data, no state library

- **Binds:** client/
- **Prevents:** each new page inventing its own data-fetching/caching approach or pulling in a state-management library piecemeal.
- **Rule:** Routing and server-state both go through React Router v8 in Data Mode (`createBrowserRouter`, route `loader`/`action`). No 3rd-party state or data-fetching library (TanStack Query included) is used. The current logged-in user is exposed via one React Context (`lib/auth.tsx`) wrapping Firebase Auth's `onAuthStateChanged` — plumbing, not a state library. Every network call to `functions/` goes through `@shared/firebase-cloude-api`; no component calls `fetch()` directly.
  <a id="ad-5"></a>

### AD-5 — No shared types package between `cli/` and `functions/`, but every contract is documented by example

- **Binds:** cli/, functions/
- **Prevents:** `cli/` and `functions/` coupling that would make them deploy-locked; and, without shared types, two hand-written implementations of one JSON shape quietly disagreeing on field names, casing, or array-vs-map structure.
- **Rule:** `cli/` and `functions/` each define their own request/response types for the HTTP contract between them — no shared types package. `shared/` (containing the backend API client) is shared between `client/` and `cli/` only, never `functions/`. In place of shared types between `cli/` and `functions/`: every cross-package endpoint's request/response is written down as a concrete sample JSON object, not just described in English — the sample is the contract both sides build against.

<a id="ad-6"></a>

### AD-6 — Skill discovery lives only in `functions/`

- **Binds:** cli/, functions/, client/
- **Prevents:** Discovery logic scattered across client/CLI, which would force each to handle GitHub rate limits and miss the opportunity to bundle validation status with discovery results.
- **Rule:** The discovery algorithm — walk a GitHub repo tree, match `SKILL.md` up to nesting depth 3, then take the whole matched directory regardless of its own depth — lives in `functions/` as a Cloud Function. Plain deterministic code; no LLM involved. Both CLI and web client call this function with a repo URL (+ optional `--skill` list). Backend uses its own GitHub token (no rate limits), performs discovery, and returns: skill list/paths, file content (blobs), commit hash, validation status, README blurb. File content is included in the response but never persisted in Firestore (only commit hash is stored — see NFR2).

**Implementation gap:** Discovery and depth-3 constraint are temporarily in `shared/github-api/` (get-skills-list.ts, get-repo-files.ts). Target: move to `functions/` per this AD. Only `getRepoInfo` (repo existence check) stays in `shared/`.

<a id="ad-7"></a>

### AD-7 — Backend returns both metadata and file content

- **Binds:** cli/, client/, functions/
- **Prevents:** `cli/`/`client/` making separate GitHub API calls after getting metadata, which would require each user to handle rate limits; and skill file content being fetched without validation status context.
- **Rule:** Backend receives repo URL + optional `--skill` argument from `cli/`/`client/`. Backend calls GitHub API using its own token (no user rate limits), performs discovery, and returns a single unified response containing: skill list/paths, file content (blobs), commit hash, validation status for previously installed skills, and README blurb. `cli/`/`client/` install directly from this response without any additional GitHub calls. File content is returned but never stored in Firestore (NFR2) — only metadata and commit hash are persisted.

<a id="ad-8"></a>

### AD-8 — CLI layering: pipeline of single-responsibility modules

- **Binds:** cli/
- **Prevents:** a command's steps (parse → fetch → write) collapsing into one undifferentiated function.
- **Rule:** `commands/<verb>/index.ts` orchestrates a pipeline of single-responsibility modules, with a local `interfaces.ts` for that command's types and a co-located `.spec.ts` per module.

<a id="ad-9"></a>

### AD-9 — Owner-scoped functions verify a Firebase Auth ID token; endpoints stay `onRequest`

- **Binds:** functions/, client/
- **Prevents:** some endpoints adopting `onCall` (a different client SDK/protocol) while others stay `onRequest`, breaking AD-4's single `@shared/firebase-cloude-api` gateway assumption; and owner checks being implemented ad hoc per endpoint.
- **Rule:** All Cloud Functions stay `onRequest` (per AD-2). An endpoint that mutates or reads owner-scoped data (e.g., favorites) requires an `Authorization: Bearer <Firebase ID token>` header, verified server-side via the admin SDK's `verifyIdToken` before the service layer runs. Public read endpoints (catalog search, list, public favorites by link) require no auth header.

<a id="ad-10"></a>

### AD-10 — Secrets via Firebase Functions v2 Secret Manager

- **Binds:** functions/
- **Prevents:** an Anthropic or GitHub API token being hardcoded or committed because there was no established pattern.
- **Rule:** Any credential `functions/` needs (Anthropic API key; a GitHub token, if/when one is needed for rate limits) is declared with `defineSecret` (Firebase Functions v2 Secret Manager integration) and injected at runtime — never a literal in source or a plain environment variable in config files.

<a id="ad-11"></a>

### AD-11 — Install-count aggregation: synchronous, via a shared helper

- **Binds:** functions/ (and any future writer of a skill's install count)
- **Prevents:** two writers of the repo-level calculated install count reimplementing the roll-up differently; and telemetry's write being conflated with validation-status logic (they're independent fields, independent helpers).
- **Rule:** `repositories-store.ts` exports `recalculateInstallCount(repoId)` — sums the `installCount` of every skill under that repo and writes the total onto the repository doc. The telemetry function calls it synchronously, right after incrementing a skill's own install count, in the same function invocation. No Firestore trigger.

<a id="ad-12"></a>

### AD-12 — Validation invocation: automatic scheduled only

- **Binds:** functions/
- **Prevents:** validation logic being scattered or reimplemented in multiple places.
- **Rule:** One service holds the validation logic (fetch latest from GitHub, call the Anthropic SDK, write `findings` and `valid` field). Only one trigger: a daily scheduled Cloud Function that automatically validates all pending repos.

<a id="ad-13"></a>

### AD-13 — Validation-status aggregation: synchronous, via a shared helper

- **Binds:** functions/ (and any future writer of a skill's validation status)
- **Prevents:** the same divergence AD-11 prevents for install count, applied to validation status: two writers reimplementing the roll-up differently, or the helper being conflated with the install-count one (they're independent fields, independent helpers, per AD-11's split).
- **Rule:** `repositories-store.ts` exports `recalculateValidationStatus(repoId)` — `validated` only if every skill has `valid: true`, otherwise `failed`; `pending` skills not yet checked don't affect the calculation. The validation service calls it synchronously, right after writing a skill's `findings` and `valid` field, in the same function invocation. No Firestore trigger — same convention as AD-11.

<a id="ad-14"></a>

### AD-14 — Favorites collection: user-scoped access pattern

- **Binds:** functions/, client/
- **Prevents:** favorites CRUD spreading across multiple endpoints or mixing user-scoping with repo-scoping concerns.
- **Rule:** `functions/src/services/user-favorites-store.ts` owns the `userFavorites` collection. Read/write requires Firebase Auth token verification (per AD-9). One user document per userId. Public read endpoint accepts `shareableLink` parameter and returns favorites without auth requirement.

<a id="ad-15"></a>

### AD-15 — Validation queue: in-memory processing with status transitions

- **Binds:** functions/
- **Prevents:** multiple validation workers processing the same repo, or "pending" repos staying stuck without visibility.
- **Rule:** When validation starts (scheduled), query all repos with `validationStatus: "pending"`, load results into an in-memory array, then iterate. For each repo, atomically change status to "in progress" before calling validation service. Service writes findings and updates status to "validated" or "failed" based on results.
