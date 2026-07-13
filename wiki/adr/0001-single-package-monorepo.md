# ADR 0001: Single-package monorepo

- **Status:** Accepted
- **Date:** 2026-07-03

## Context

SkillStack needs a React front end and an Express back end in one repository, sharing types
and schemas. It started as a single root-level Vite + React app. We want a clear folder-per-
responsibility layout (`client`, `server`, `shared`, `db`, `wiki`) that is easy to teach from,
without introducing tooling that obscures the fundamentals.

## Decision

Use a **single root `package.json`** with plain folders, not npm workspaces or Turborepo.
Cross-folder imports resolve through TypeScript path aliases (`@shared`, `@db`, `@eleks-ui/*`)
declared once in `tsconfig.base.json` and mirrored in `vite.config.ts`. The client builds with
Vite (`root: client`); the server runs with `tsx` and is typechecked with `tsc`.

## Alternatives considered

- **npm workspaces** — first-class per-package boundaries and independent dependency sets, but
  adds hoisting rules and `-w` flags that are extra concepts for a teaching prototype.
- **Turborepo / Nx** — great task caching and orchestration at scale, but overkill for two apps
  and risks students learning the tool instead of the architecture.

## Consequences

- **+** One `node_modules`, one lockfile, one `npm install`; the smallest possible mental model.
- **+** Sharing code is trivial — `shared/` is imported directly via an alias, no publish step.
- **+** Non-breaking upgrade path: workspaces or Turborepo can be layered on later if needed.
- **−** No enforced dependency isolation between client and server; discipline is by convention.
- **−** A single `tsconfig.base.json` must serve both browser and Node targets (handled by
  per-target `tsconfig.client.json` / `tsconfig.server.json` that extend the base).
