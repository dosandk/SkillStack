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

### E2E (Playwright, from root)

`test:e2e` builds `functions`, then runs `playwright test` inside `firebase emulators:exec`.
It spawns the Vite **dev** server (not a build) so `import.meta.env.DEV` is true and the
client targets the local Functions emulator. Specs run serially (`workers: 1`) because they
share one emulator and clear/seed Firestore between cases. Chromium is in `node_modules`
(`PLAYWRIGHT_BROWSERS_PATH=0`); use `playwright:install`, not `npx playwright install`.
Variants: `test:e2e:ui`, `test:e2e:headed`.
