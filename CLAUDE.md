# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mandatory workflow gate

**This section decides when to run implement.** For **product and feature
implementation** — however trivial (one line, UI-only, config, test, CLI,
functions, product/architecture docs-in-repo) — follow the agent triage flow
instead of editing directly: run `requirements-complexity-agent` first, then
`spark` (simple) or `octopus` (complex), with `unituna` / `e2eagle` after when
tests are classified. The workflow contract is in
`.cursor/skills/implement/SKILL.md`; agent definitions are in `.cursor/agents/`.

**Do not** use this gate (and do not open the implement skill) for Cursor/AI
tooling configuration (`.cursor/` skills, agents, rules, hooks, and similar
agent config) — edit those directly or via their dedicated skill/workflow.
Skip also for pure Q&A, read-only review, commit-only, or explicit "don't
change code" requests.

## Repository layout

Single repo, multiple independently-installed packages (NOT npm workspaces — `client` deps live in the root `package.json`; `functions/` and `cli/` each have their own `package.json` / `node_modules`). Node 24 (`.nvmrc` pins v24.3.0). Base TS options and cross-folder path aliases are centralized in `tsconfig.base.json` and mirrored in `vite.config.ts` / `vitest.config.ts`.

- **`client/`** — React 19 + Vite front-end. Vite `root` is `client/`; build output goes to `dist/`. Firebase web SDK client in `client/src/lib/firebase.ts`; backend call wrapper in `client/src/lib/api.ts`. Uses the vendored ELEKS UI library (see below).
- **`functions/`** — Firebase Cloud Functions (own package, `firebase-admin` / `firebase-functions`). The backend API.
- **`shared/`** — cross-package services & utils, exposed via the `@shared` alias. Exports `githubService` (`shared/github-api/`) and `backendService` (`shared/firebase-cloude-api/`). Consumed by both `cli/` and `client/`.
- **`cli/`** — `skillstack-cli`, a Commander-based CLI built with `tsup` (entry `src/bin.ts`, lib `src/index.ts`). Main command lives in `cli/src/commands/add/` — pulls repo skill files from GitHub, tracks the install via `backendService`, and writes files into `.agents/`.
- **`wiki/`** — planning docs (stories, tasks); not code.
- **`e2e/`** — Playwright specs (`*.e2e.ts`).

### Path aliases

Always import via aliases, never relative paths across packages:

```ts
import { githubService, backendService } from '@shared';
import { Button } from '@eleks-ui/components';
import { EleksUIThemeProvider, useEleksUITheme } from '@eleks-ui/theme';
```

`@shared`, `@eleks-ui/components`, `@eleks-ui/theme` are defined in `tsconfig.base.json`, `vite.config.ts`, and `vitest.config.ts` (and `cli/tsup.config.ts` for `@shared`) — update all relevant places when adding one. ELEKS UI component source is under `client/src/components/eleks-ui/`; `*.figma.tsx` files are excluded from the build. For any UI work prefer the `use-eleks-ui` skill (`.cursor/skills/use-eleks-ui/`).

## Backend architecture (`functions/`)

`functions/src/index.ts` is the **only** file that exports Firebase entry points. It runs `admin.initializeApp()` before importing anything else, then re-exports each `apiXxx` handler. Every backend feature is a folder under `functions/src/functions/<name>/` with a strict three-layer split (see `.cursor/rules/single-responsibility.mdc`):

1. **`index.ts` — handler.** A thin `onRequest` that maps HTTP ⇄ domain only: parse the request, call the domain function, translate result/errors to status codes, log at this boundary. No business rules, no Firestore.
2. **`function.ts` — domain.** Business rules only. Validates input with a Zod schema at the boundary (`schema.parse`, throw-on-invalid), orchestrates the store, throws typed domain errors. Knows nothing about HTTP or Firestore APIs.
3. **`functions/src/services/repositories-store.ts` — store.** The sole Firestore access layer: owns collection names (`repositories` + its `skills` subcollection), document shapes, `repositorySchema`, and all reads/writes/install-counter mutations. Domain code goes through the store, never touches Firestore directly.

Data model: a `repositories` document holds repo metadata + `skills[]`; each skill is also a doc in that repo's `skills` subcollection carrying an `installCount`.

## Common commands

Run from the **repo root** unless noted.

```bash
npm run dev          # Vite dev server for the client (dev:client)
npm run build        # tsc -p tsconfig.client.json + vite build → dist/
npm run typecheck    # tsc -p tsconfig.client.json (no emit)
npm run test:run     # vitest run — 'shared' project (node) + 'client' project (jsdom)
npm run test:coverage
npm run emulators    # firebase emulators:start (auth:9099, functions:5001, firestore:8080, UI on)
npm run test:e2e     # build functions, then run Playwright under auth+functions+firestore emulators
```

Run a single unit test: `npx vitest run path/to/file.spec.ts` or `npx vitest run -t "test name"`.

**Linting:** the root `lint:eslint` / `lint:editorconfig` scripts are placeholder `echo` stubs; only `lint:prettier` runs. Run ESLint directly with `npx eslint .` (flat config in `eslint.config.js` — typescript-eslint + react-hooks + SonarJS). `husky` + `lint-staged` run prettier on staged `client/**` files pre-commit; `pre-push` runs the tests.

### Functions (run inside `functions/`)

```bash
npm run build                 # tsc
npm run test:run              # unit tests (*.spec.ts)
npm run test:integration      # integration specs against a RUNNING emulator (vitest.integration.config.js)
npm run test:integration:ci   # build + spin up functions+firestore emulators, then integration tests
npm run test:all              # unit + integration:ci — the deploy predeploy gate (see firebase.json)
npm run serve                 # emulators for functions only
npm run db:seed / db:clear    # seed/clear Firestore (node --experimental-strip-types)
npm run deploy                # firebase deploy --only functions
```

Integration specs require the Firestore + Functions emulators and run **serially** (they share one emulator instance and clear/seed Firestore between runs). `firebase deploy --only functions` is gated by `test:all` via the `predeploy` hook in `firebase.json`.

### CLI (run inside `cli/`)

```bash
npm run build        # tsup → dist/ (bin at dist/bin.js)
npm run dev          # tsup --watch
npm run test:run     # vitest run
```

### E2E (Playwright, from root)

`test:e2e` builds `functions`, then runs `playwright test` inside `firebase emulators:exec`. It spawns the Vite **dev** server (not a build) so `import.meta.env.DEV` is true and the client targets the local Functions emulator. Specs run serially (`workers: 1`) because they share one emulator and clear/seed Firestore between cases. Also: `test:e2e:ui`, `test:e2e:headed`.

## Testing conventions

Full rules in `.cursor/rules/test-conventions.mdc`. Key points:

- `*.spec.ts(x)` colocated next to the module under test. Unit specs `*.spec.ts`; integration specs use the functions integration config; Playwright specs are `*.e2e.ts` under `e2e/`.
- Exactly **one** top-level `describe` per file (no nested/sibling `describe`), naming the unit in domain language. Cases are `it(...)` starting with `should`.
- AAA body separated by **blank lines only** — never `// Arrange` / `// Act` / `// Assert` label comments.
- Assert the specific error (message/type), not a bare `.toThrow()`.
- Do **not** test Zod schemas directly — test the behavior of the function that consumes the schema.
- Coverage thresholds (vitest): lines 90 / branches 85 / functions 90 / statements 90.

## Code conventions

Enforced via `.cursor/rules/*.mdc` — read the relevant rule before writing code:

- **Errors** (`error-handling.mdc`, `alwaysApply`): throw `Error`/subclass (never strings); preserve root cause with `{ cause }`; log once at the boundary (handler / CLI entrypoint); use domain error types; validate public input early; no empty/rethrow-only `catch`; English messages, no secrets.
- **Comments** (`code-comments.mdc`, `alwaysApply`): code is self-explanatory; comment only non-trivial nuances or upstream issue links; every comment is English and prefixed `NOTE:`.
- **Naming** (`naming-convention.mdc`): no single-letter identifiers (except generics `T`/`K`/`V`/`E`, `_` unused); names state the domain, not the type; camelCase values, PascalCase types/components, SCREAMING_SNAKE module constants; React handlers use `event` not `e`.
- **TypeScript** (`typescript-best-practices.mdc`): `interface` for object shapes, `type` for schema-inferred/unions/intersections; untrusted input typed `unknown` + validated with Zod at the boundary (throw-on-invalid, not `safeParse`); `import type` for type-only imports; no `enum`/`namespace`; React components as `function Component(props: Props)`, not `React.FC`.
- **Imports** (`js-import-order.mdc`): built-ins → external libs → project/aliases → styles, each group blank-line separated.
- **Single Responsibility** (`single-responsibility.mdc`): one reason to change; keep transport / domain / data-access in separate units (the `functions/` split is the reference).

## Git & PRs

Simplified Git Flow (`contributing.md`): `main` and `develop` are protected (PR only, ≥1 approval, CI must pass). Branch off `develop` for `feature/{issue}-{slug}`; off `main` for `hotfix/{issue}-{slug}`. Squash-merge, delete branch after. Commit messages follow `commitlint.config.js` (enforced by husky). Shared agent settings live under `.agents/` and are symlinked into `.claude/` / `.cursor/` — run `git config core.symlinks true` after cloning.
