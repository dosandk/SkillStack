---
name: AI-Assisted Dev Tooling
status: active
created: 2026-07-21
updated: 2026-07-21
---

# AI-Assisted Dev Tooling (Cursor)

## Rules (`.cursor/rules/*.mdc`)

| Rule                      | Scope              | What it does                                                                                                                                                        |
| ------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `architecture-invariants` | general, always-on | Includes [`wiki/architecture-invariants.md`](architecture-invariants.md) directly — no paraphrasing, so there's no second copy of AD-1..13 to drift from the source |
| `commit-conventions`      | general            | Conventional Commits shape per `commitlint.config.js`                                                                                                               |
| `testing-conventions`     | general            | Story = E2E, task = unit/integration; where each lives per package                                                                                                  |
| `docs-sync`               | general            | When scope/decisions change, update the matching `wiki/` file                                                                                                       |
| `client-conventions`      | `client/**`        | React Router v8 Data Mode, no 3rd-party state/data lib, `lib/api.ts` gateway, eleks-ui usage                                                                        |
| `backend-conventions`     | `functions/**`     | Adapter/store split, Zod at store boundary, auth-token verification, Secret Manager, deny-all rules                                                                 |
| `cli-conventions`         | `cli/**`           | Pipeline-of-modules, calls `functions/` for Firestore-touching work, direct-to-GitHub for content only                                                              |

## Templates (`wiki/templates/`)

| Template                                 | Scope   | What it does                                                                  |
| ---------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| `task-template.md` / `story-template.md` | general | Codifies the frontmatter+sections shape used throughout `wiki/`               |
| `pr-description-template.md`             | general | Summary / test plan / linked story-task ids                                   |
| `scaffold-function.template.ts`          | backend | Boilerplate for a new `functions/<verb>.ts` + `services/<noun>-store.ts` pair |
| `scaffold-route.template.tsx`            | client  | Boilerplate for a new `routes/<page>/`                                        |
| `scaffold-cli-command.template.ts`       | cli     | Boilerplate for a new `commands/<verb>/` pipeline                             |

## Commands (`.cursor/commands/*.md`)

| Command                                                          | Scope                  | What it does                                                                                                                                                           |
| ---------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/implement-task`                                                | general                | Reads a task + its story + the invariants, implements it, writes its specified tests                                                                                   |
| `/code-review`                                                   | general                | Reviews a diff against the invariants + relevant module rule + the task's Quality gates                                                                                |
| `/commit`                                                        | general                | Drafts + validates a Conventional Commit, runs commitlint                                                                                                              |
| `/deploy-check`                                                  | general                | Pre-flight typecheck/build/test across affected packages; stops short of `firebase deploy`                                                                             |
| `/update-task-status`                                            | general                | Updates a task's frontmatter + its story's Tasks table row                                                                                                             |
| `/scaffold-function`, `/scaffold-route`, `/scaffold-cli-command` | backend / client / cli | Instantiate the matching template                                                                                                                                      |
| `/dev-task` (meta)                                               | general                | Chains: next ready task → implement → test → review → update status → offer commit. Still a prompt the developer can interrupt at any step, not an autonomous workflow |

## Hooks

| Hook                            | Type                  | What it does                                                                                                                                     |
| ------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Extend `pre-commit` lint-staged | git (existing, Husky) | Currently `client/**` only — extend to `functions/**`/`cli/**`                                                                                   |
| Extend `pre-push`               | git (existing, Husky) | Add typecheck across all 3 packages (today's `npm test` is a stub)                                                                               |
| `beforeShellExecution`          | Cursor hook           | Matcher on `git push.*--force`/`firebase deploy`/`rm -rf`, `ask` (not silent `deny`), `failClosed: true`                                         |
| `beforeReadFile`                | Cursor hook           | Blocks `.env*`/credential files from reaching agent context — belt-and-suspenders alongside AD-10 (secrets live in Secret Manager, never a file) |
| `afterFileEdit`                 | Cursor hook           | Fires the relevant lint/format check right after an edit lands, tighter feedback loop than commit-time-only                                      |
