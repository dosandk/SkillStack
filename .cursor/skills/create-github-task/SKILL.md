---
name: create-github-task
description: Create a new GitHub issue/task in dosandk/SkillStack and add it to the GitHub Project board (users/dosandk/projects/10). Use when the user asks to add, create, or file a task, ticket, issue, bug, or feature request.
---

# Create a GitHub task (orchestrator)

Three stages: **analyze** (`task-analyzer` subagent) -> **prepare + approve** (this skill) ->
**publish** (`publish-github-task` skill). Details, contracts and error handling:
[reference.md](reference.md).

Constants: repo `dosandk/SkillStack`, project owner `dosandk` (user project), number `10`
([board](https://github.com/users/dosandk/projects/10/views/1)). Labels, branch prefixes and base
branches come from [contributing.md](../../../contributing.md) ("Github issue labels"); do not copy them here.

## Hard rule: no GitHub write before approval

Anything that creates or changes something on GitHub (issue, label, project item, board field,
comment, close) needs an explicit "yes" / "ok" from the user, given in a **separate reply after**
the complete draft was shown. Vague phrases ("let's try", "test it") are not approval; this
includes test issues. Any edit to the draft cancels the earlier approval. Read-only `gh` commands
need no confirmation. Never close or delete an issue. Cursor will also prompt for each `gh` write
command (guard hook); that prompt is an extra safeguard and never replaces draft approval.

## Stage 1 - Task analysis

Delegate the raw request to the `task-analyzer` subagent (read-only). Start the Task description
and prompt with `[task-analyzer]`. It returns a `task-brief` JSON block, checked by the
`subagentStop` hook.

- `READY` -> go to Stage 2.
- `NEEDS_CLARIFICATION` -> ask the user the questions; re-run Stage 1 with the answers.
- Missing/invalid block (after the hook's two corrections) or agent error -> report it and ask
  the user how to proceed. Never invent requirements to reach `READY`.

## Stage 2 - Preparation (read-only)

1. Preflight: `gh auth status`, `gh repo view dosandk/SkillStack --json viewerPermission`,
   `gh label list -R dosandk/SkillStack --limit 100`,
   `gh issue list -R dosandk/SkillStack --search "<keywords>" --state open`, and Project access
   (`gh project view 10 --owner dosandk`). Repo and Project permissions are separate.
   Failures and recovery commands: [reference.md](reference.md#error-handling).
2. Duplicates are advisory: show a similar issue, explain the similarity, ask whether to continue.
3. Build the English draft from the brief using the templates in
   [reference.md](reference.md#issue-templates), then check it: required fields, valid label,
   body matches the template, operations target the intended repo and project.
4. Show **one** message: target repo and project, title, label, assignee, full body, duplicates,
   missing label, permission limits, and the numbered list of every write that approval triggers.
   Then **stop**. Run no write command in this turn.

## Approval gate

- Yes -> Stage 3 with exactly the displayed draft and actions.
- No / cancel -> stop; nothing was written.
- Edit -> revise, show the full draft again, wait again.
- A write not in the approved list needs a new approval.

## Stage 3 - Publish

Read and follow `.cursor/skills/publish-github-task/SKILL.md` yourself (no subagent), passing the
approved draft and action plan. Then report: status (`SUCCESS` / `PARTIAL_SUCCESS` / `FAILED`),
issue number and URL, label, verified project membership, suggested branch
(`feature/<number>-<slug>` from `develop`, or `hotfix/<number>-<slug>` from `main`) and remaining actions.

## Optional: board fields (e.g. Status)

Only on request, and only as a separately approved write; see
[reference.md](reference.md#optional-board-fields).
