---
name: SkillStack
type: architecture-spine
purpose: build-substrate
altitude: initiative
paradigm: 'Layered architecture with a single server-authoritative gateway'
scope: 'Whole platform — client (web), functions (backend), cli — brownfield; ratifies what is already built'
status: final
created: 2026-07-19
updated: 2026-07-30
binds: []
sources: ['wiki/requirements.md']
companions: ['wiki/architecture-invariants.md', 'wiki/requirements.md']
---

# Architecture Spine — SkillStack

## Design Paradigm

**Layered architecture with a single server-authoritative gateway.** Three independently-deployed
units — `client/` (web SPA), `cli/` (published npm package), `functions/` (backend) — but only
one of them, `functions/`, ever touches Firestore. Every other unit is a consumer that goes
through it. Within `functions/` itself, a thin **adapter layer** does HTTP in/out and nothing
else; a **service/store layer** owns one Firestore collection each (its Zod schema + CRUD); no
other code touches Firestore.

| Layer                 | Namespace                           | Owns                                                                                                                                                                                           |
| --------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP adapter          | `functions/src/functions/*.ts`      | Parse request, call one service, map errors to HTTP status. No Firestore, no business rules.                                                                                                   |
| Service / store       | `functions/src/services/*-store.ts` | One Firestore collection's Zod schema + CRUD. The only code with Firestore access.                                                                                                             |
| Client gateway client | `client/src/routes/**`              | SPA routes call `functions/` via `@shared/firebase-cloude-api` (route loaders/actions). No component calls `fetch()` directly.                                                                 |
| CLI gateway calls     | `cli/src/commands/**`               | Calls `functions/` via `@shared/firebase-cloude-api` for discovery + file content + validation status (see [AD-6](architecture-invariants.md#ad-6), [AD-7](architecture-invariants.md#ad-7)). |

## Invariants & Rules

See [`architecture-invariants.md`](architecture-invariants.md) for the full AD-1..AD-15 list and the dependency-direction diagram.

## Consistency Conventions

| Concern               | Convention                                                                                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Naming                | Files: kebab-case. Exported Cloud Functions: `api` + PascalCase (`apiWriteRepository`, `apiGetRepositoriesList`).                                                                                                                                      |
| Data & formats        | Firestore doc id = auto-generated ref id. Errors: JSON body `{ error: string }` with a meaningful HTTP status (400 invalid payload, 500 unexpected failure). Zod validates at the store boundary (inside `services/*-store.ts`), never in the adapter. |
| State & cross-cutting | Logging via `firebase-functions/logger` (structured). No direct Firestore/Firebase-admin credentials outside `functions/`. Path alias `@shared` points to `shared/index.ts` (configured in `tsconfig.base.json`, `vite.config.ts`, `cli/tsup.config.ts`). |

## Data Model

Firestore schema (see [AD-1](architecture-invariants.md#ad-1), [AD-2](architecture-invariants.md#ad-2) for access rules):

### `repositories` collection

```typescript
{
  // Core identification
  owner: string,                    // GitHub repo owner
  repoSlug: string,                 // Full repo path (e.g., "owner/repo-name")
  defaultBranch: string,            // Default branch name
  commitHash: string,               // Git commit SHA that was validated/installed
  
  // Metadata
  readmeBlurb: string,              // Short description from repo README
  
  // Calculated/aggregate fields (see AD-11, AD-13)
  totalInstalls: number,            // Sum of all skills' installCount
  validationStatus: "pending" | "in progress" | "validated" | "failed",  // Rollup of skill statuses
  
  // Timestamps
  createdAt: Timestamp,             // When first added to catalog
  updatedAt: Timestamp              // Last modified
}
```

### `repositories/{repoId}/skills` subcollection

```typescript
// Document ID = skill name/path
{
  name: string,                     // Skill name (matches doc ID)
  path: string,                     // Relative path in repo
  
  // Validation
  valid: boolean,                   // true = passed validation, false = failed
  findings: Array<{                 // Results from Anthropic validation (FR-BE5)
    severity: "critical" | "recommendation",
    message: string
  }>,
  
  // Usage tracking
  installCount: number              // Incremented with each install (AD-11)
}
```

### `userFavorites` collection

```typescript
// Document ID = userId (from Firebase Auth)
{
  userId: string,                   // Firebase Auth user ID
  favorites: Array<{
    repoId: string,                 // Reference to repositories/{repoId}
    skillNames: string[],           // Empty array = all skills, specific names = partial selection
    addedAt: Timestamp
  }>,
  shareableLink: string,            // Generated token for sharing (AD-14)
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Note:** Skill file content is never stored in Firestore (NFR2). The skill details page fetches content directly from GitHub using `path` + `commitHash`.

## Stack

| Name                                | Version                                                                                                                                                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TypeScript                          | `~6.0.2` (root/client), `^5.9.3` (cli), `^7.0.2` (functions) — three independently-managed packages, versions not unified                                                                                                                        |
| Node                                | 24 (`.nvmrc`; `functions` engines pin `24`)                                                                                                                                                                                                      |
| React                               | ^19.2.6                                                                                                                                                                                                                                          |
| Vite                                | ^8.0.12                                                                                                                                                                                                                                          |
| React Router                        | ^8 (Data Mode) — requires Node 22+/Vite 7+/React 19+; adopted per [AD-4](architecture-invariants.md#ad-4). |
| Firebase (client SDK)               | ^12.15.0                                                                                                                                                                                                                                         |
| firebase-admin / firebase-functions | ^13.6.0 / ^7.0.0                                                                                                                                                                                                                                 |
| Firestore                           | via firebase-admin, v2 Cloud Functions (`onRequest`)                                                                                                                                                                                             |
| Zod                                 | ^4.4.3                                                                                                                                                                                                                                           |
| commander                           | ^15.0.0 (cli)                                                                                                                                                                                                                                    |
| tsup                                | ^8.5.1 (cli build)                                                                                                                                                                                                                               |
| vitest                              | `^4.1.10` (root/client, cli) |
| eleks-ui                            | vendored under `client/src/components/eleks-ui`                                                                                                                                                                                                  |

## Structural Seed

```text
{repo-root}/
  client/       # React 19 + Vite SPA. src/routes/<page>/ (component + loader/action),
                # src/lib/auth.tsx, src/lib/firebase.ts, src/components/eleks-ui/ (vendored).
                # Calls backend via @shared/firebase-cloude-api
  functions/    # Cloud Functions backend — sole Firestore gateway (AD-1)
    src/functions/   # thin HTTP adapters (AD-2)
    src/services/    # one *-store.ts per Firestore collection (AD-2)
  cli/          # separate npm package (skillstack-cli), tsup build
    src/commands/<verb>/   # pipeline of single-responsibility modules (AD-8)
  shared/       # code shared between client/ and cli/ (never functions/) — backend API client
                # (firebase-cloude-api) and utilities. Path alias: @shared
  wiki/         # requirements.md, architecture.md + architecture-invariants.md, stories/, tasks/
```

AD ids in the tree above ([AD-1](architecture-invariants.md#ad-1),
[AD-2](architecture-invariants.md#ad-2), [AD-8](architecture-invariants.md#ad-8))
resolve to `architecture-invariants.md`.

**Deployment & environments.** Single Firebase project (`skillstack-724d8`), no separate
staging project. Hosting auto-deploys via GitHub Actions on push to `main`
(`firebase-hosting-merge.yml`) plus PR preview channels (`firebase-hosting-pull-request.yml`).
Cloud Functions deploy via `npm run deploy` in `functions/`.

## Requirements Traceability

See [`requirements.md`](requirements.md) for the full FR/NFR list.
