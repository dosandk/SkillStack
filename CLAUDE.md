# CLAUDE.md

## Repository layout

Single repo, **multiple independently-installed packages** — NOT npm workspaces. `client` deps
live in the **root** `package.json`; `functions/` and `cli/` each have their own `package.json`
and `node_modules`. Node is pinned to **v24.3.0** via `.nvmrc`.

| Package      | Role                                | Own `package.json` | Key entry points & notes                                                                                                                                                                                                        |
| ------------ | ----------------------------------- | :----------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client/`    | React 19 + Vite front-end           |         no         | Vite `root` = `client/`; build → `dist/`. Firebase web SDK: `client/src/lib/firebase.ts`. Backend wrapper: `client/src/lib/api.ts`. ELEKS UI source under `client/src/components/eleks-ui/`; `*.figma.tsx` excluded from build. |
| `functions/` | Firebase Cloud Functions (backend)  |        yes         | Uses `firebase-admin` / `firebase-functions`. Layering rules: `.cursor/rules/single-responsibility.mdc`.                                                                                                                        |
| `shared/`    | Cross-package services & utils      |         no         | Exposed via `@shared`. Exports `githubService` (`shared/github-api/`) and `backendService` (`shared/firebase-cloude-api/`). Consumed by `cli/` and `client/`.                                                                   |
| `cli/`       | `skillstack-cli` (Commander + tsup) |        yes         | Entry `src/bin.ts`. Main command under `cli/src/commands/add/` — pulls repo skill files from GitHub, tracks install via `backendService`, writes into `.agents/`.                                                               |
| `wiki/`      | Planning docs, ADRs (not code)      |         —          | ADR authoring flow: `.cursor/skills/update-adr/SKILL.md`.                                                                                                                                                                       |
| `e2e/`       | Playwright specs                    |         —          | `*.e2e.ts` files only.                                                                                                                                                                                                          |

## Path aliases

Base TS options and cross-folder aliases are declared in `tsconfig.base.json` and **mirrored
in four other places**. Adding or renaming an alias means editing every entry below:

| File                 | Why it needs the alias                     |
| -------------------- | ------------------------------------------ |
| `tsconfig.base.json` | Source of truth (TS resolution)            |
| `vite.config.ts`     | Client build & dev server                  |
| `vitest.config.ts`   | Unit test resolution (`client` + `shared`) |
| `cli/tsup.config.ts` | CLI bundle (needs `@shared` only)          |

Current aliases: `@shared`, `@eleks-ui/components`, `@eleks-ui/theme`.
Import ordering rules: `.cursor/rules/js-import-order.mdc`.
UI import rules and MCP workflow: `.cursor/skills/use-eleks-ui/SKILL.md`.

## Firebase backend specifics

- `functions/src/index.ts` is the **only** file that exports Firebase entry points. It calls
  `admin.initializeApp()` **before** importing any handler module, then re-exports each
  `apiXxx` handler. Do not import handlers above this call — it breaks Admin SDK initialization.
- Firestore data model: a `repositories` document holds repo metadata plus a `skills[]` array;
  each skill is **also** a document in that repo's `skills` subcollection carrying an
  `installCount` counter.
- `firebase deploy --only functions` is gated by `npm run test:all` (inside `functions/`) via
  the `predeploy` hook in `firebase.json`.

## Common commands

Run from the **repo root** unless noted.

```bash
npm run dev              # ./dev.sh — Vite dev server for the client
npm run build            # tsc -p tsconfig.client.json + vite build → dist/
npm run typecheck        # tsc -p tsconfig.client.json (no emit)
npm run test:run         # vitest run — 'shared' (node) + 'client' (jsdom) projects
npm run emulators        # firebase emulators:start (auth:9099, functions:5001, firestore:8080, UI on)
npm run test:e2e         # build functions, run Playwright under auth+functions+firestore emulators
npm run pre-commit       # lint-staged (also fired by husky pre-commit hook)
```

Run a single unit test: `npx vitest run path/to/file.spec.ts` or `npx vitest run -t "test name"`.
Coverage workflow (thresholds, per-module runs, verdicts) lives in
`.cursor/skills/check-coverage/SKILL.md`.

**Lint stubs:** the root `lint:eslint` and `lint:editorconfig` scripts are placeholder
`echo`s — only `lint:prettier` actually runs from that group. Run ESLint directly with
`npx eslint .` (flat config in `eslint.config.js`). `husky` + `lint-staged` run prettier on
staged `client/**` files pre-commit; the `pre-push` hook runs the tests.

Commit-message format and commit workflow: `.cursor/skills/git-commit/SKILL.md`
(commitlint allows only `feat` / `fix` / `docs`, header ≤ 50 chars).

### Functions (run inside `functions/`)

```bash
npm run test:run              # unit tests (*.spec.ts)
npm run test:integration      # integration specs against a RUNNING emulator (serial)
npm run test:integration:ci   # build + spin up functions+firestore emulators, then integration tests
npm run test:all              # unit + integration:ci — the deploy predeploy gate
npm run db:seed / db:clear    # seed / clear Firestore
npm run deploy                # firebase deploy --only functions
```

Integration specs share one emulator instance and clear/seed Firestore between runs — they
**must** run serially. Use `*.i.spec.ts` for integration specs (excluded from the unit
config).

### CLI (run inside `cli/`)

```bash
npm run build        # tsup → dist/ (bin at dist/bin.js)
npm run dev          # tsup --watch
npm run test:run     # vitest run
```

### E2E (Playwright, from root)

`test:e2e` builds `functions`, then runs `playwright test` inside `firebase emulators:exec`.
It spawns the Vite **dev** server (not a build) so `import.meta.env.DEV` is true and the
client targets the local Functions emulator. Specs run serially (`workers: 1`) because they
share one emulator and clear/seed Firestore between cases. Variants: `test:e2e:ui`,
`test:e2e:headed`. Authoring flow: `.cursor/skills/create-e2e-tests/SKILL.md`.
