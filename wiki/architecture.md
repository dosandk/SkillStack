# SkillStack Architecture

SkillStack is a catalog of AI engineering building blocks — **skills, rules, MCPs, and
agents** — modelled after [skills.sh](https://www.skills.sh/). It is a teaching prototype
for a course on using Claude Code / Cursor capabilities well.

## Monorepo layout (single root `package.json`)

The whole repo is one npm package (no workspaces). Folders are separated by responsibility,
and cross-folder imports go through TypeScript path aliases (`@shared`, `@db`, `@eleks-ui/*`).

| Folder     | Responsibility                                                              |
| ---------- | --------------------------------------------------------------------------- |
| `client/`  | React 19 + Vite front end. Vite `root` is `client/`.                        |
| `server/`  | Express API. Run with `tsx` in dev; typechecked with `tsc`.                 |
| `shared/`  | Zod schemas + inferred TS types. Single source of truth, used by both sides.|
| `db/`      | Data-access layer + the markdown content itself under `db/content/`.        |
| `wiki/`    | This documentation, ADRs, and the backlog.                                  |
| `.cursor/` | Cursor rules/skills applied across the repo.                                |

See [ADR 0001](./adr/0001-single-package-monorepo.md) for why a single package over workspaces.

## Request flow

```
Browser (client)                Vite dev server        Express (server)         db layer
  fetch('/api/skills')  ──────▶  proxy '/api'  ──────▶  GET /api/:type  ──────▶  repo.list('skill')
                                 → :3001                 validate :type          │
                                                         │                       ▼
  render <Card/>  ◀──────────────────────────────◀──────┘   ContentItem[]   read db/content/skills/*.md
                                                                             parse frontmatter (gray-matter)
                                                                             validate against zod schema
```

- In dev, the client calls `/api/*` and Vite proxies it to the Express server on port `3001`
  (`vite.config.ts` → `server.proxy`). No CORS needed in the browser; the server also enables
  `cors()` for direct calls.
- Express validates the `:type` segment against `CONTENT_TYPES` from `@shared`, then delegates
  to the repository.

## The storage seam

`db/src/index.ts` defines a `ContentRepository` interface and a `createContentRepository()`
factory. Today the only implementation is `FileContentRepository`, which reads markdown files,
parses frontmatter with `gray-matter`, and validates it against the matching Zod schema from
`@shared`. The server depends only on the interface, so migrating to MongoDB later means adding
a `MongoContentRepository` and changing the factory — nothing else moves. See
[ADR 0002](./adr/0002-file-based-content-db.md).

## Content model

Every entry is a markdown file at `db/content/<type>s/<slug>.md`. Frontmatter holds the
metadata (validated by Zod); the markdown body becomes the `content` field. All four types
share a base schema (`slug`, `name`, `description`, `type`, `tags`, `author`, `createdAt`) and
add a few type-specific fields (e.g. skills add `install`, MCPs add `server`/`transport`).

## Commands

| Command             | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Runs client (Vite, :5173) and server (:3001) together.   |
| `npm run build`     | Builds the client bundle and typechecks the server.      |
| `npm run typecheck` | Typechecks client and server without emitting.           |
| `npm run lint`      | ESLint across the repo.                                  |
