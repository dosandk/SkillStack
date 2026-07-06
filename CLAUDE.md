# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
It is also read by the Claude Code extension inside Cursor. Cursor's native agent uses
`.cursor/rules/*.mdc` for scoped/auto-attached rules.

## What this is

SkillStack is a catalog of AI engineering building blocks — **skills, rules, MCPs, and agents** —
modelled after [skills.sh](https://www.skills.sh/). It is a teaching prototype for a course on
using Claude Code / Cursor capabilities well, so the architecture itself is meant to be exemplary
and readable. See `wiki/architecture.md` and the ADRs in `wiki/adr/` for the reasoning behind
key decisions.

## Commands

```bash
npm run dev          # client (Vite, :5173) + server (Express, :3001) together via concurrently
npm run dev:client   # Vite only
npm run dev:server   # Express only (tsx watch, auto-reload); resolves aliases via tsconfig.server.json
npm run build        # build:client (tsc + vite build → dist/) then build:server (tsc typecheck)
npm run typecheck    # tsc -p tsconfig.client.json && tsc -p tsconfig.server.json (no emit)
npm run lint         # eslint over the repo
PORT=4000 npm run dev:server   # override API port
```

The browser talks to the app on `:5173`; Vite proxies `/api/*` to Express on `:3001` (see
`vite.config.ts` → `server.proxy`), so no CORS config is needed in the browser.

There is **no real test suite yet** — `npm test` is a placeholder that echoes text. Do not claim
tests pass; verify changes by running the app and hitting the API (see below).

### Verifying the API by hand

```bash
curl http://localhost:3001/api/skills            # list a type (route is PLURAL)
curl http://localhost:3001/api/skills/find-skills # one entry (includes markdown body as `content`)
curl http://localhost:5173/api/skills            # same, through the Vite proxy
```

## Architecture

**Single-package monorepo — one root `package.json`, no npm workspaces / Turborepo**
(see `wiki/adr/0001-single-package-monorepo.md`). Folders are separated by responsibility and
import each other through TypeScript path aliases, not relative `../../` chains:

| Folder    | Role                                                                 |
| --------- | -------------------------------------------------------------------- |
| `client/` | React 19 + Vite front end. **Vite `root` is `client/`**, not repo root. |
| `server/` | Express 5 API. Run with `tsx`; typechecked (not emitted) by `tsc`.   |
| `shared/` | Zod schemas + `z.infer` types. **Single source of truth** for both sides. |
| `db/`     | Data-access layer + the markdown content itself under `db/content/`. |
| `wiki/`   | Architecture docs, ADRs, and the backlog (`wiki/backlog/stories.md`).|

### Path aliases (defined once in `tsconfig.base.json`, mirrored in `vite.config.ts`)

- `@shared` / `@shared/*` → `shared/src` — used by client and server.
- `@db` / `@db/*` → `db/src` — server only (it touches the filesystem; never import `@db` in `client/`).
- `@eleks-ui/components`, `@eleks-ui/theme` → the vendored UI library under `client/src/components/eleks-ui`.

`tsconfig.base.json` holds the shared compiler options and `paths`; `tsconfig.client.json` (browser,
bundler resolution) and `tsconfig.server.json` (Node) extend it. **`baseUrl` is intentionally absent**
(deprecated in TS 6), so `paths` targets carry a leading `./`. `tsconfig.json` is a solution file that
only references the others — it has no `paths`, which is why `dev:server` must pass
`--tsconfig tsconfig.server.json` for `tsx` to resolve the aliases at runtime.

### The storage seam (why `db/` looks the way it does)

`db/src/index.ts` defines a `ContentRepository` interface and a `createContentRepository()` factory.
The only implementation today is `FileContentRepository`, which resolves file paths via
`db/content/index.json` (a slug → relative-path manifest), reads the target markdown file,
parses frontmatter with `gray-matter`, and validates it against the matching Zod schema from `@shared`.
The server depends only on the interface. Migrating to MongoDB later = write a `MongoContentRepository`
and change the factory — nothing else moves (see `wiki/adr/0002-file-based-content-db.md`). Preserve
this seam; don't let the server or client reach around the repository into the filesystem.

### Content model and the singular/plural convention

Content types are **singular** in code (`ContentType = 'skill' | 'rule' | 'mcp' | 'agent'`) but
**plural** in API routes and on-disk folders (`skills`, `rules`, `mcps`, `agents`). The mapping lives
in one place — `shared/src/schemas/content.ts` (`CONTENT_TYPE_PLURAL`, `contentTypeFromPlural`,
`pluralOf`) — and is reused by the server routes, the db layer, and the client hook. When adding a
type or field, edit the Zod schema in `shared/` first; types (`z.infer`) and validation flow from there.

Note: unquoted YAML dates parse as JS `Date`, so `createdAt` in `baseContentSchema` is normalized to a
`YYYY-MM-DD` string via `z.preprocess` — authors don't need to quote dates.

### Request flow

`client` `fetch('/api/skills')` → Vite proxy → Express `GET /api/:type` (validates plural `:type`) →
`ContentRepository.list('skill')` → look up slugs in `db/content/index.json` → read + parse + Zod-validate each file. Malformed
frontmatter throws, surfaced by the central error handler in `server/src/app.ts` as a 500 with the
Zod message.

## Conventions (from `.cursor/rules/` and `contributing.md`)

**UI**: App code must use the **eleks-ui** design system — import components from `@eleks-ui/components`
and theme from `@eleks-ui/theme`; icons from `@mui/icons-material` only. Do **not** import components
directly from `@mui/material` (except inside `client/src/components/eleks-ui/` itself, which wraps MUI).
Prefer the `sx` prop and theme tokens over inline `style={{}}` / raw hex.

**Vendored `eleks-ui` caveat**: `client/src/components/eleks-ui/` is vendored and has many pre-existing
lint/type issues; `.figma.tsx` files require `@figma/code-connect` (not installed) and are excluded from
the client typecheck. `npm run lint` therefore exits non-zero from these pre-existing errors — that is
not caused by app code. Don't try to fix the whole library; keep new code clean and scoped.

**Comments**: code should be self-explanatory. Comment only for a non-trivial nuance or a tracked
upstream issue, and **every comment starts with `NOTE:`** (e.g. `// NOTE: ...`). No narration of what
the code does. Full `https://` URLs for issue links.

**Import order** (blank line between groups): (1) Node built-ins → (2) external packages →
(3) project/aliases (`@shared`, `@db`, `@eleks-ui/*`, relative) → (4) styles last.

**TypeScript**: avoid `any` in app code (`erasableSyntaxOnly` is on — no TS enums, no parameter
properties). Unused args/vars must be prefixed `_` to pass lint (e.g. the 4-arg Express error handler's
`_next`).

**Git Flow** (`contributing.md`): `main` and `develop` are protected, PR-only. Feature work branches
off `develop` as `feature/{issue-number}-{slug}` and merges back to `develop`; only `release/*` and
`hotfix/*` target `main`. Never push directly to `main`/`develop`; never force-push them.

**Commits** (commitlint, enforced by husky `commit-msg`): Conventional Commits with type restricted to
**`feat` | `fix` | `docs`** only (not `chore`/`refactor`/`style`/`test`). Header ≤ 50 chars, lowercase
subject, no trailing period, optional kebab-case scope. Husky also runs `lint-staged` (prettier +
lint) pre-commit on `{client,server,shared,db}/**` and `npm test` pre-push.

**GitHub issues**: when asked to implement an issue, follow `.cursor/skills/implement-issue/SKILL.md`
and require a type label (`enhancement` / `bug` / `documentation` / `hotfix`) — don't guess the type.
