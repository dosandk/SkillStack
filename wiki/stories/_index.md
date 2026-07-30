# Story Catalogue — SkillStack

Last updated: 2026-07-29

Derived from [../requirements.md](../requirements.md) and
[../architecture.md](../architecture.md) (the architecture spine — read it first; every
story below builds on its invariants rather than re-deciding them). The spine's
AD-1..AD-13 rules themselves live in [../architecture-invariants.md](../architecture-invariants.md) —
a companion file, split out so it can be included wholesale elsewhere without a second
copy drifting from it. Each row links to a story file in this folder; each story lists
the tasks that make it up, which live in
[../tasks/](../tasks/).

## Stories vs. tasks

A **story** is a complete end-to-end workflow with a full user experience, spanning
whatever modules it needs (frontend, backend, cli). It owns the requirements for
**E2E tests** — golden path, critical negative, and a permission/edge boundary scenario.
A **task** is one piece of work inside a single module, tagged `module: frontend |
backend | cli | platform`. It owns the requirements for **unit and integration tests**
for that module's own boundary. A story is done when every task in its table is done —
tasks are the independently-verifiable unit of module-scoped work; stories are the unit
of "can a user actually do this end to end."

There is no separate "platform foundation" story — no story is only infrastructure with
no user-visible workflow. Foundational work (the Firestore schema, `firestore.rules`,
routing setup) is a task inside whichever story first needs it, per that story's own
Tasks table.

See [../architecture-invariants.md](../architecture-invariants.md) for the binding architectural decisions (AD-1..AD-15) that constrain every story and task.

## Catalogue

| ID                        | Title                                            | Domain(s)              | Status  | Owner       |
| -------------------------- | ------------------------------------------------- | ----------------------- | ------- | ----------- |
| story-catalog-search       | Browse & Search Validated Skills                  | frontend, backend, platform | planned | @unassigned |
| story-auth-profile         | GitHub Login & Profile                            | frontend                | planned | @unassigned |
| story-favorites            | Favorites & Sharing                               | frontend, backend       | planned | @unassigned |
| story-validate-skill       | Validate a Repository/Skill                       | frontend, backend       | planned | @unassigned |
| story-cli-install-flows    | CLI — Install Skills (All Flows)                  | cli, backend            | planned | @unassigned |

## Build order (high level)

1. `story-cli-install-flows` — foundational story. Establishes the Firestore schema (SS-101 with `"in progress"` status and `valid: boolean`),
   implements `scanRepository` with four-branch logic (SS-301 — discovery + file content + commit comparison + `"in progress"` detection), and all CLI install flows (first-time, same commit, different commit, during validation).
   Primary use case for the backend architecture ([AD-6](../architecture-invariants.md#ad-6), [AD-7](../architecture-invariants.md#ad-7)).
2. `story-catalog-search` — needs (1)'s schema. Establishes deny-all security rules,
   the client's routing setup, and the search UI. Reuses schema from (1).
3. `story-auth-profile` — needs routing from (2). Unlocks a real logged-in identity for
   everything that follows.
4. `story-favorites` — needs (1)'s `scanRepository`, (2)'s routing, and (3)'s logged-in user.
   Introduces userFavorites collection and share functionality.
5. `story-validate-skill` — needs (4) to have created something pending to validate.
   Updated for `"in progress"` status transitions and `valid: boolean` model.

**Note on existing code:** `client/`, `functions/`, and `cli/` all have some code
already (GitHub auth wiring, a minimal `repositories` collection, temporary skill discovery in `shared/github-api`).
None of it fully matches this catalogue's schema or the architecture spine's invariants
yet (e.g. no `skills` subcollection with `valid: boolean`, no `"in progress"` status, no `firestore.rules`, `scanRepository` needs four-branch logic per [AD-7](../architecture-invariants.md#ad-7),
CLI's file write logic needs updating for backend response format, no `userFavorites` collection) — each task above says exactly
what needs to change, so treat existing code as a starting point to rework, not as
already satisfying a task.
