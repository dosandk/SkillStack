# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SkillStack is a catalog of AI agent skills modelled after [skills.sh](https://www.skills.sh/) — a teaching
prototype for a course on using Claude Code / Cursor well. It has three moving parts:

1. A **web catalog** where users browse/search validated skills and repos, log in with GitHub, and upload
   their own repos for validation.
2. A **CLI** (`skillstack`, published to npm) that installs skills from any GitHub repo into a local project
   (`npx skillstack add <repo-url> --skill <name>`), mirroring the `npx skills add ...` UX.
3. A **Firebase backend** (Cloud Functions + Firestore) that tracks repos/skills, their validation status
   (validation runs via an LLM through the Anthropic SDK), and install telemetry. Firestore stores only
   metadata + the GitHub commit hash, never the skill files themselves.

Requirements are distilled into citable FR/NFR ids in `wiki/requirements.md`. Architecture spine
(paradigm, stack, structural seed): `wiki/architecture.md`.
Its binding invariants — layering, the Cloud-Functions-as-sole-Firestore-gateway rule, auth
pattern, etc. (AD-1..AD-13) — live in the companion file `wiki/architecture-invariants.md`,
split out so nothing paraphrases them a second time. Story catalogue and per-story task
breakdown: `wiki/stories/_index.md` and `wiki/stories/*.md` (module-scoped tasks live in
`wiki/tasks/`). Check all of these before starting non-trivial work — the requirements file
for which FR/NFR the change relates to, the invariants file for which ADs constrain it, the
story/task files for whether a story is `done`/`planned`, its E2E test scenarios, and the
unit/integration test requirements on its tasks.

## Monorepo layout

The root `package.json` covers everything **except `/cli`**, which is its own npm package (no npm workspaces).

| Folder       | Responsibility                                                                                                                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `client/`    | React 19 + Vite front end. Vite `root` is `client/`. Calls backend via `shared/firebase-cloude-api`.                                                                                                                                                         |
| `functions/` | Firebase Cloud Functions — the backend. TypeScript, compiled to `lib/` via `tsc`. Zod schemas for Firestore document shapes live here. Entry point: `src/index.ts`, compiled output: `lib/index.js`.                                                         |
| `cli/`       | Separate npm package (`skillstack-cli`), built with `tsup`. Entry points: `src/bin.ts` (the `skillstack` binary via commander) and `src/index.ts`. Calls backend via `shared/firebase-cloude-api`.                                                           |
| `shared/`    | Shared code between `client/` and `cli/` (never `functions/`). Contains `firebase-cloude-api/` (backend API client) and `github-api/` (temporary — only `getRepoInfo` will remain; rest moves to `functions/`). Path alias: `@shared`.                       |
| `wiki/`      | Requirements (`requirements.md`), architecture spine (`architecture.md` — paradigm/stack/structural seed/data model) plus binding invariants (`architecture-invariants.md` — AD-1..AD-13), story catalogue (`stories/`), and module-scoped tasks (`tasks/`). |

## Commands

Run from the repo root unless noted.

**Root package:**

```bash
# Development
npm run dev                  # Vite dev server for client
npm run dev:client           # Same as dev
npm run emulators            # Firebase emulators (auth, functions, firestore)

# Testing
npm test                     # vitest (root/client tests)
npm run test:run             # vitest run
npm run test:coverage        # vitest run --coverage
npm run test:e2e             # Playwright E2E tests (builds functions, starts emulators)
npm run test:e2e:ui          # E2E with Playwright UI
npm run test:e2e:headed      # E2E with headed browser

# Build & Quality
npm run build                # tsc typecheck + vite build for client
npm run build:client         # vite build
npm run typecheck            # tsc -p tsconfig.client.json
npm run lint                 # eslint .
npm run lint:prettier        # prettier --write over client/src
```

**CLI package** (`cd cli`):

```bash
npm run build                # tsup — bundles src/bin.ts and src/index.ts to dist/
npm run dev                  # tsup --watch
npm test                     # vitest (cli tests)
npm run test:run             # vitest run
npm run test:coverage        # vitest run --coverage
```

**Functions package** (`cd functions`):

```bash
npm run build                # tsc — compiles src/ to lib/
npm run build:watch          # tsc --watch
npm test                     # vitest (unit tests)
npm run test:run             # vitest run
npm run test:coverage        # vitest run --coverage
npm run test:integration     # vitest integration tests
npm run test:integration:ci  # Build + emulators + integration tests
npm run test:all             # Unit + integration tests
npm run serve                # firebase emulators:start --only functions
npm run deploy               # firebase deploy --only functions (runs build first)
npm run logs                 # firebase functions:log
npm run db:seed              # Seed Firestore emulator with test data
npm run db:clear             # Clear Firestore emulator data
```

## Architecture notes

See `wiki/architecture.md` for the full architecture spine, and `wiki/architecture-invariants.md`
for the binding decisions themselves (Cloud Functions as the sole Firestore gateway, backend
adapter/store layering, auth-token verification pattern, calculated-field aggregation, etc.,
as AD-1..AD-13) — check the invariants file before any non-trivial backend/client/cli change,
not just this section.

- **Path aliases** (`@eleks-ui/components`, `@eleks-ui/theme`, `@shared`) are defined in `tsconfig.base.json` and mirrored in `vite.config.ts`'s `resolve.alias` for the client build and `cli/tsup.config.ts` for the CLI build. If you add a new alias, update all three places.
- Backend work belongs in `functions/` against Firestore — specifically, only `functions/src/services/*.ts`; see `architecture-invariants.md`'s AD-1/AD-2.
