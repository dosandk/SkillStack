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

Full requirements/spec: `wiki/project_description.md`. Feature catalogue and per-feature ticket breakdown:
`wiki/features/_index.md` and `wiki/features/*.md` (tickets live in `wiki/tickets/`). Check these before
starting non-trivial work to see whether a feature is `done`/`planned` and what its acceptance criteria are.

## Monorepo layout

The root `package.json` covers everything **except `/cli`**, which is its own npm package (no npm workspaces —
cross-folder imports go through the TS path aliases in `tsconfig.base.json`).

| Folder       | Responsibility                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `client/`    | React 19 + Vite front end. Vite `root` is `client/`, but `resolve.alias` and `tsconfig` paths reach into `shared/` and `db/` at the repo root.                                             |
| `functions/` | Firebase Cloud Functions — the target backend that will replace `/server`. Currently minimal.                                                                                              |
| `server/`    | **Legacy** Express API being deleted in favor of `functions/`. Don't build new features here.                                                                                              |
| `shared/`    | Zod schemas + inferred TS types (`shared/src/schemas/`), the single source of truth consumed by both client and backend. Browser-safe (no `fs` access) so it can be Vite-bundled directly. |
| `db/`        | **Legacy** markdown-file content store (`db/content/`) being replaced by Firestore. Don't build new features here.                                                                         |
| `cli/`       | Separate npm package (`skillstack-cli`), built with `tsup`. Entry points: `src/bin.ts` (the `skillstack` binary via commander) and `src/index.ts`.                                         |
| `wiki/`      | Product spec, feature catalogue, tickets, and templates for both — no ADRs currently checked in.                                                                                           |
| `.cursor/`   | Cursor rules (`rules/*.mdc`) and skills (`skills/*/SKILL.md`) that apply across the repo — see "Cursor rules & skills" below.                                                              |

## Commands

Run from the repo root unless noted.

```bash
npm run dev              # client (Vite) + legacy server, concurrently
npm run dev:client        # Vite dev server only
npm run emulators         # Firebase emulators (auth, functions, hosting)

npm run build             # tsc typecheck + vite build for client, tsc build for server
npm run typecheck         # tsc -p tsconfig.client.json && tsc -p tsconfig.server.json (no emit)
npm run lint               # eslint .
npm run lint:prettier      # prettier --write over client/server/shared/db src
npm test                   # currently a stub — no real test suite is wired up yet
```

CLI package (`cd cli`):

```bash
npm run build   # tsup — bundles src/bin.ts and src/index.ts to dist/
npm run dev     # tsup --watch, NODE_ENV=development
```

Functions package (`cd functions`):

```bash
npm run serve   # firebase emulators:start --only functions
npm run deploy  # firebase deploy --only functions
npm run logs    # firebase functions:log
```

There is no per-test-file runner configured — `npm test` is a placeholder echo. Don't assume a test framework
is present; check before writing tests.

## Architecture notes

- **Path aliases** are defined once in `tsconfig.base.json` (`@shared`, `@shared/*`, `@db`, `@db/*`,
  `@eleks-ui/components`, `@eleks-ui/theme`) and mirrored in `vite.config.ts`'s `resolve.alias` for the client
  build. If you add a new cross-folder alias, update both places.
- **Client structure**: `client/src/features/<feature>/` holds feature-scoped components + hooks (e.g.
  `features/auth/AuthProvider.tsx` + `useAuth.ts`, `features/content/ContentList.tsx` + `useContent.ts`).
  `client/src/components/eleks-ui/` holds the local ELEKS UI component/theme source — see below.
- **`shared/src`** defines Zod schemas (e.g. `schemas/content.ts`) and infers TS types from them; both client
  and backend should import types from here rather than redefining shapes.
- The Express server (`server/`) proxies through Vite's dev server at `/api` (see `vite.config.ts`), but is
  being phased out — new backend work belongs in `functions/` against Firestore, not `server/`.

## UI conventions (ELEKS UI) — required for all React work

This project uses **ELEKS UI**, not raw MUI, as its design system (full rules: `.cursor/skills/eleks-ui/SKILL.md`).

- Import components from `@eleks-ui/components` and theme utilities from `@eleks-ui/theme`; icons still come
  from `@mui/icons-material`.
- **Never** import from `@mui/material`/`@material-ui/core` or other UI libraries for anything ELEKS UI already
  provides.
- Before building a component, check `client/src/components/eleks-ui/components/*/index.tsx` for local
  overrides/customizations — local source is the source of truth over any MCP-provided docs when they conflict.
- If a needed component doesn't exist in ELEKS UI (MCP or local), stop and say so explicitly rather than
  substituting another library.

## Code style

- **Comments**: self-explanatory code by default. Only comment non-trivial nuances (workarounds, ordering
  constraints, side effects) or to link a tracked upstream issue — every comment must start with `NOTE:`.
  Never comment on _what_ code does.
- **Import order**: built-in modules → external libraries → project/aliased imports → style imports, one blank
  line between each group (see `.cursor/rules/js-import-order.mdc` for the full example).

## Git workflow

Simplified Git Flow (`contributing.md`) — two long-lived branches, PR-only, no direct pushes:

- `main` — production, tagged on release. `develop` — staging integration branch.
- `feature/{issue-number}-{slug}` off `develop`, squash-merged back, 1 reviewer minimum.
- `hotfix/{issue-number}-{slug}` off `main`, back-merged to `develop`, 2-hour review SLA.
- `release/{semver}` off `develop` for pre-release stabilization only.
- GitHub issues need exactly one type label (`enhancement`, `bug`, `documentation`, `hotfix` — priority in that
  order if multiple apply) to determine branch type/base.

**Commits** follow Conventional Commits, enforced by commitlint + husky `commit-msg` hook
(`commitlint.config.js`):

- Allowed types: `feat`, `fix`, `docs` only (no `chore`/`refactor`/`style`/`test`, etc.).
- Header (`type(scope): subject`) ≤ 50 chars total; subject lowercase, no trailing period.
- Body/footer lines ≤ 72 chars, blank line before each.
- PR titles mirror the commit header format.

## Cursor rules & skills

These live under `.cursor/` and several encode workflow requirements Claude should follow when doing equivalent
work in this repo:

- `.cursor/skills/git-commit/SKILL.md` — full commit workflow: draft message, validate with
  `npx commitlint`, only commit after explicit user confirmation.
- `.cursor/skills/implement-issue/SKILL.md` (triggered by `.cursor/rules/implement-github-issue.mdc`) — for a
  shared `github.com/{owner}/{repo}/issues/{number}` link: read the issue via the GitHub MCP server, classify by
  label, branch per the Git Flow rules above, implement, commit via the git-commit skill, push, and open a PR
  using `.github/PULL_REQUEST_TEMPLATE.md`.
- `.cursor/skills/eleks-ui/SKILL.md` — see "UI conventions" above.
- `.cursor/skills/firebase/**` — vendored reference docs for Firebase Auth, Firestore, Hosting, Functions, etc.
  (installed via the skills CLI this project itself builds — see `skills-lock.json`). Consult the relevant
  subfolder when working in `functions/` or on Firebase config rather than guessing at APIs.
