# Feature Catalogue — SkillStack

Last updated: 2026-07-10

Derived from [../project_description.md](../project_description.md). Each row links to a
feature file in this folder; each feature lists its tickets, which live in
[../tickets/](../tickets/).

| ID                              | Title                          | Domain     | Status  | Owner        |
| ------------------------------- | ------------------------------ | ---------- | ------- | ------------ |
| feature-foundation-platform     | Foundation — Monorepo & Deployment | foundation | done    | @unassigned |
| feature-auth-github             | Authentication — GitHub Login  | auth       | done    | @unassigned |
| feature-catalog-browse          | Catalog — Browse & Filter Skills | catalog    | done    | @unassigned |
| feature-backend-firestore-model | Backend — Firestore Data Model | backend    | planned | @unassigned |
| feature-backend-functions       | Backend — Cloud Functions API  | backend    | planned | @unassigned |
| feature-validation-engine       | Validation — LLM Skill Validation | validation | planned | @unassigned |
| feature-cli-discovery           | CLI — Skill Discovery          | cli        | planned | @unassigned |
| feature-cli-install             | CLI — Skill Installation       | cli        | planned | @unassigned |
| feature-cli-registry-integration | CLI — Registry Integration    | cli        | planned | @unassigned |
| feature-cli-telemetry           | CLI — Install Telemetry        | cli        | planned | @unassigned |
| feature-ui-search-discovery     | UI — Search & Discovery        | ui         | planned | @unassigned |
| feature-ui-upload               | UI — Repository/Skill Upload   | ui         | planned | @unassigned |
| feature-ui-validation-results   | UI — Validation & Results      | ui         | planned | @unassigned |
| feature-ui-profile              | UI — User Profile              | ui         | planned | @unassigned |

## Domains

- **foundation** — platform baseline (monorepo, deployment).
- **auth** — GitHub authentication.
- **catalog** — public browsing experience.
- **cli** — the `skillstack` CLI: discovery, install, registry integration, telemetry.
- **backend** — Firestore data model and Cloud Functions API.
- **validation** — LLM-based skill validation (on-demand + scheduled).
- **ui** — authenticated web experiences: search, upload, validation results, profile.

## Build order (high level)

1. `feature-foundation-platform`, `feature-auth-github`, `feature-catalog-browse` (done)
2. `feature-backend-firestore-model` → `feature-backend-functions`
3. `feature-validation-engine`
4. CLI: `feature-cli-discovery` → `feature-cli-install` → `feature-cli-registry-integration` → `feature-cli-telemetry`
5. UI: `feature-ui-search-discovery`, `feature-ui-upload`, `feature-ui-validation-results`, `feature-ui-profile`
