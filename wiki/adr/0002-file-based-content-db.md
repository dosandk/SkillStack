# ADR 0002: File-based content store behind a repository

- **Status:** Accepted
- **Date:** 2026-07-03

## Context

Each catalog entry (skill/rule/MCP/agent) is authored as a markdown file, like the pages on
skills.sh. For the prototype we want zero database setup, content that lives in git and is
diff-reviewable, and validation that catches malformed entries early. We also know we will
likely move to MongoDB once users can create their own entries through the UI.

## Decision

Store content as markdown files at `db/content/<type>s/<slug>.md`. Frontmatter carries the
metadata and is validated at read time against the Zod schema from `@shared`; the markdown body
becomes the `content` field. Access goes through a `ContentRepository` interface with a
`createContentRepository()` factory (`db/src/index.ts`); the only current implementation is
`FileContentRepository`.

## Alternatives considered

- **MongoDB now** — matches the end state but adds infra and seeding work with no payoff while
  the catalog is small and read-only.
- **A JSON file / SQLite** — loses the human-authored, git-reviewable markdown format that is
  central to the product concept.

## Consequences

- **+** No database to run; content is versioned and reviewed in PRs.
- **+** The rest of the app depends only on `ContentRepository`, so the future MongoDB migration
  is a new adapter plus a one-line factory change — a deliberate teaching example of the
  ports-and-adapters seam.
- **+** Invalid frontmatter fails loudly at read time (surfaced as a 500 by the API).
- **−** No write path or querying beyond list/get; fine for a read-only catalog, insufficient
  once users create entries — which is the trigger to implement `MongoContentRepository`.

## Migration trigger

When we add user-created entries, implement `MongoContentRepository` against the same interface,
switch the factory, and write a one-off script to import existing `db/content/**` markdown.
