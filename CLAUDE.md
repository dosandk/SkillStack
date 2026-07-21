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

Full requirements/spec: `wiki/project_description.md`, distilled into citable FR/NFR ids in
`wiki/requirements.md`. Architecture spine (paradigm, stack, structural seed): `wiki/architecture.md`.
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

| Folder       | Responsibility                                                                                                                                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| `client/`    | React 19 + Vite front end. Vite `root` is `client/`.                                                                                                                                                                                                        |
| `functions/` | Firebase Cloud Functions — the backend. TypeScript, compiled to `lib/` via `tsc`. Zod schemas for Firestore document shapes live here. Entry point: `src/index.ts`, compiled output: `lib/index.js`.                                                        |
| `cli/`       | Separate npm package (`skillstack-cli`), built with `tsup`. Entry points: `src/bin.ts` (the `skillstack` binary via commander) and `src/index.ts`.                                                                                                          |
| `wiki/`      | Product spec (`project_description.md`), its FR/NFR ids (`requirements.md`), the architecture spine (`architecture.md` — paradigm/stack/structural seed) plus its binding invariants (`architecture-invariants.md` — AD-1..AD-13), a story catalogue (`wiki/stories/`, each story with E2E test scenarios), module-scoped tasks (`wiki/tasks/`, each with unit/integration test requirements), and templates for both. |     |

## Commands

Run from the repo root unless noted.

```bash
npm run dev              # client (Vite) + legacy server, concurrently
npm run dev:client        # Vite dev server only
npm run emulators         # Firebase emulators (auth, functions, hosting)

npm run build             # tsc typecheck + vite build for client, tsc build for server
npm run typecheck         # tsc -p tsconfig.client.json && tsc -p tsconfig.server.json (no emit)
npm run lint               # eslint .
npm run lint:prettier      # prettier --write over client/src
npm test                   # currently a stub — no real test suite is wired up yet
```

CLI package (`cd cli`):

```bash
npm run build   # tsup — bundles src/bin.ts and src/index.ts to dist/
npm run dev     # tsup --watch, NODE_ENV=development
```

Functions package (`cd functions`):

```bash
npm run build   # tsc — compiles src/ to lib/
npm run test:run  # vitest run — unit tests
npm run serve   # firebase emulators:start --only functions
npm run deploy  # firebase deploy --only functions (runs build first via predeploy)
npm run logs    # firebase functions:log
```

There is no per-test-file runner configured — `npm test` is a placeholder echo. Don't assume a test framework
is present; check before writing tests.

## Architecture notes

See `wiki/architecture.md` for the full architecture spine, and `wiki/architecture-invariants.md`
for the binding decisions themselves (Cloud Functions as the sole Firestore gateway, backend
adapter/store layering, auth-token verification pattern, calculated-field aggregation, etc.,
as AD-1..AD-13) — check the invariants file before any non-trivial backend/client/cli change,
not just this section.

- **Path aliases** (`@eleks-ui/components`, `@eleks-ui/theme`) are defined in `tsconfig.base.json` and mirrored in `vite.config.ts`'s `resolve.alias` for the client build. If you add a new alias, update both places.
- Backend work belongs in `functions/` against Firestore — specifically, only `functions/src/services/*.ts`; see `architecture-invariants.md`'s AD-1/AD-2.
