# Story Catalogue — SkillStack

Last updated: 2026-07-10

Derived from [../project_description.md](../project_description.md). Each row links to a
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

## Catalogue

| ID                              | Title                                           | Domain(s)         | Status  | Owner       |
| ------------------------------- | ----------------------------------------------- | ----------------- | ------- | ----------- |
| story-foundation-registry-model | Platform Foundation & Registry Data Model       | platform, backend | partial | @unassigned |
| story-auth-profile              | GitHub Login & Profile                          | frontend, backend | partial | @unassigned |
| story-catalog-search            | Browse & Search Validated Skills                | frontend, backend | planned | @unassigned |
| story-upload-repo               | Upload a Repository/Skill for Validation        | frontend, backend | planned | @unassigned |
| story-validate-skill            | Validate a Repository/Skill & View Results      | frontend, backend | planned | @unassigned |
| story-cli-install-new           | CLI — Install Skills from a Repo (first-time)   | cli, backend      | planned | @unassigned |
| story-cli-install-update        | CLI — Reinstall/Update an Already-Tracked Skill | cli               | planned | @unassigned |

## Build order (high level)

1. `story-foundation-registry-model` (partial — platform scaffold/deploy done, Firestore
   schema + rules still planned).
2. `story-auth-profile` (login done, profile page + owned-repos query planned) and
   `story-catalog-search` (an earlier card/search/sort UI exists as reference only — it
   was built against the legacy `db/content` mock data and needs a rewrite against the
   new Firestore/Cloud-Functions-backed data, so nothing in it is done) can proceed in
   parallel once the schema is ready — both are read paths over it.
3. `story-upload-repo` → `story-validate-skill` (validation needs content to exist first).
4. `story-cli-install-new` → `story-cli-install-update` (update flow reuses and extends
   the first-time install pipeline).
