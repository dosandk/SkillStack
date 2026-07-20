# Story Catalogue — SkillStack

Last updated: 2026-07-19

Derived from [../project_description.md](../project_description.md) and
[../architecture.md](../architecture.md) (the architecture spine — read it first; every
story below builds on its invariants rather than re-deciding them). Each row links to a
story file in this folder; each story lists the tasks that make it up, which live in
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

## Catalogue

| ID                        | Title                                            | Domain(s)              | Status  | Owner       |
| -------------------------- | ------------------------------------------------- | ----------------------- | ------- | ----------- |
| story-catalog-search       | Browse & Search Validated Skills                  | frontend, backend, platform | planned | @unassigned |
| story-auth-profile         | GitHub Login & Profile                            | frontend                | planned | @unassigned |
| story-upload-repo          | Upload a Repository                               | frontend, backend       | planned | @unassigned |
| story-validate-skill       | Validate a Repository/Skill                       | frontend, backend       | planned | @unassigned |
| story-cli-install-new      | CLI — Install Skills from a Repo (first-time)      | cli, backend            | planned | @unassigned |
| story-cli-install-update   | CLI — Reinstall/Update an Already-Tracked Repo     | cli, backend            | planned | @unassigned |

## Build order (high level)

1. `story-catalog-search` — baseline. Establishes the Firestore schema, deny-all
   security rules, and the client's routing setup, alongside its own search UI. Every
   other story depends on this schema/routing existing.
2. `story-auth-profile` — needs routing from (1). Unlocks a real logged-in identity for
   everything that follows.
3. `story-upload-repo` — needs (1)'s schema and (2)'s logged-in user. Its
   `scanRepository` function is shared with `story-cli-install-new`.
4. `story-validate-skill` — needs (3) to have created something pending to validate.
5. `story-cli-install-new` — needs (3)'s `scanRepository`. Can be built in parallel with
   (4) once (3) is done.
6. `story-cli-install-update` — extends (5)'s scan/install pipeline with the
   already-tracked-repo branch.

**Note on existing code:** `client/`, `functions/`, and `cli/` all have some code
already (GitHub auth wiring, a minimal `repositories` collection, a CLI `pull` command).
None of it fully matches this catalogue's schema or the architecture spine's invariants
yet (e.g. no `skills` subcollection, no `firestore.rules`, no `scanRepository`, CLI does
its own ad hoc tree walk instead of calling the backend) — each task above says exactly
what needs to change, so treat existing code as a starting point to rework, not as
already satisfying a task.
