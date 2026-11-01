# create-github-task: workflow reference

Single source of truth for the **steps** (preflight, draft, approval gate, publishing) is the skill
files, so they are not repeated here:

- Stages 1-2 and the approval gate: [SKILL.md](SKILL.md)
- Stage 3 (publishing, verification, failure handling, result JSON):
  [publish-github-task/SKILL.md](../publish-github-task/SKILL.md)

This file holds what the skills link to: contracts, templates, error handling and hook details.

## Components

| Component | File | Role |
| --- | --- | --- |
| Orchestrator skill | `.cursor/skills/create-github-task/SKILL.md` | Runs the stages, preflight, draft, approval, reporting |
| Task Analyzer subagent | `.cursor/agents/task-analyzer.md` | Stage 1. `readonly: true`; returns a Task Brief |
| Publishing skill | `.cursor/skills/publish-github-task/SKILL.md` | Stage 3. Run by the parent agent with `gh`; no extra subagent |
| Hook: Task Brief validation | `hooks/validate-task-handoff.mjs` in this folder (`subagentStop`, registered in `.cursor/hooks.json`) | Validates the analyzer's handoff |
| Hook: GitHub command guard | `hooks/guard-github-commands.mjs` in this folder (`beforeShellExecution`, registered in `.cursor/hooks.json`) | Extra confirmation prompt for `gh` commands that are not plain reads |
| Human approval | Orchestrator, between Stage 2 and 3 | The only thing that authorizes GitHub writes |

The hooks check data and commands. Skills do the work. **Approval is a conversation step, never inferred by a
hook or by command text.** Repository rules (labels, branches) live in `contributing.md`.

```text
user request -> [1 task-analyzer] -> subagentStop hook -> [2 preflight + draft] -> STOP
   -> user: yes -> [3 publish-github-task] -> verify -> report
```

## Stage 1 - Task analysis (contract)

- **Executor:** `task-analyzer` (read-only; may read the repo and run `gh issue list/view`).
- **Input:** raw user request. The Task description and prompt start with `[task-analyzer]`.
- **Output:** a short summary followed by exactly one last fenced block:

````text
```task-brief
{ "status": "READY", "type": "enhancement", "title": "...", "description": "...",
  "acceptanceCriteria": ["..."] }
```
````

  - `type` is `enhancement`, `bug`, `documentation` or `hotfix`.
  - `bug` uses `stepsToReproduce` (array), `expected`, `actual` instead of `acceptanceCriteria`.
  - Clarification: `{ "status": "NEEDS_CLARIFICATION", "questions": ["..."] }`.

| Result | Transition |
| --- | --- |
| `READY`, hook silent | Stage 2 |
| `NEEDS_CLARIFICATION` | Ask the user, re-run Stage 1 with the answers |
| Invalid | Hook asks the analyzer for a correction (max 2); if still invalid, report to the user |
| Agent error/aborted | Report and ask the user; do not treat as success |

The parent never invents missing requirements to force `READY`. The parent also does a quick
self-check (block present, `status` known, required fields filled) because the hook is bounded
and, if `node` is unavailable, may not run at all.

## Stage 2 - Draft content

Steps are in [SKILL.md](SKILL.md#stage-2---preparation-read-only). The draft is in English and
contains: target repo and project, title, label, assignee (if asked), body from the templates
below, duplicates, missing label, permission limits and the numbered list of planned GitHub writes
(create label if missing, create issue, add to project 10).

Draft check before showing it: required fields present, label is one of the four in
`contributing.md`, body matches its template, every planned write targets `dosandk/SkillStack` /
project 10.

### Issue templates

Feature / improvement / docs / hotfix:

```markdown
## Summary

<one or two sentences>

## Details

<context, links>

## Acceptance criteria

- [ ] <criterion>
```

Bug: replace "Acceptance criteria" with `## Steps to reproduce`, `## Expected`, `## Actual`.

## Error handling

| Scenario | Behavior |
| --- | --- |
| `gh` missing | Stop. Ask the user to run `winget install --id GitHub.cli`, restart the terminal, `gh auth login` |
| Not authenticated | Stop before drafting writes. `gh auth login` |
| Missing `project` scope | `gh auth refresh -s project` |
| Repo permission `READ` | Mention in the draft: labels will not apply, project add may fail |
| Missing label | List "create label" in the planned writes; create only after approval |
| Possible duplicate | Show it; ask before creating another issue |
| User rejects draft | Stop; no writes |
| Issue created, project add failed | `PARTIAL_SUCCESS`. Keep the URL, check `projectItems` for auto-add, never recreate the issue, propose only `item-add`, ask for separate approval |
| `issue create` errored but may have succeeded | Search GitHub first; never auto-repeat create; ask the user if the issue cannot be identified reliably |

Publishing-specific failures are detailed in
[publish-github-task/SKILL.md](../publish-github-task/SKILL.md#failure-handling).

## Optional: board fields

Only on request. Show field and value, get approval, then:

```powershell
gh project view 10 --owner dosandk --format json        # PROJECT_ID
gh project field-list 10 --owner dosandk --format json  # FIELD_ID, OPTION_ID
gh project item-list 10 --owner dosandk --format json   # ITEM_ID
gh project item-edit --project-id <PROJECT_ID> --id <ITEM_ID> --field-id <FIELD_ID> --single-select-option-id <OPTION_ID>
```

## Hook 1 - Task Brief validation (`subagentStop`)

Registered in `.cursor/hooks.json` (`timeout: 10`, `loop_limit: 2`, fail-open, no `matcher`).
Event fields used: `subagent_type`, `status`, `task`, `description`, `summary`,
`agent_transcript_path`, `loop_count`. Output field: `followup_message`.

- **Identification:** `subagent_type === "task-analyzer"` **or** `task`/`description` starts with
  `[task-analyzer]`. Cursor does not document the `subagent_type` value for custom agents, so the
  marker is the reliable path. Any other subagent: ignored (`{}`).
- **Not `completed`** (`error`, `aborted`): ignored; the parent handles the failure.
- **Brief source:** the last `task-brief` fenced block in `summary`; if absent, in the file at
  `agent_transcript_path`. Only that JSON is parsed; prose is never interpreted.
- **READY:** non-empty `title` (at most 256 characters) and `description`, supported `type`, non-empty
  `acceptanceCriteria` (bug: `stepsToReproduce`, `expected`, `actual`).
  **NEEDS_CLARIFICATION:** non-empty `questions`. Any other `status` is invalid.
- **Valid:** returns `{}` (no follow-up). **Invalid:** returns `followup_message` listing the
  problems, while `loop_count < 2`; after that `{}`.
- **Safety:** read-only (never writes files, never touches GitHub); on any hook error it prints
  `{}` and exits 0.

Limitation: Cursor documents `summary` only as an "output summary". If it is truncated, the
transcript fallback is used; if neither contains the block, the hook asks for a correction.
`failClosed` is intentionally off for this hook: a missing `node` must not block the analysis stage.

## Hook 2 - GitHub command guard (`beforeShellExecution`)

Registered with `matcher: "gh"`, `timeout: 10`, `failClosed: true`. Input: `command`. Output:
`permission` (`allow` / `ask`) plus `user_message` and `agent_message`.

| Command | Result |
| --- | --- |
| No `gh` token (also checked inside wrappers, quotes, chains, and behind a path such as `C:\...\gh.exe` or `./gh`) | `allow`; the hook ignores it |
| Single plain read: `gh auth status`, `repo view`, `issue list/view`, `label list`, `project view/item-list/field-list` | `allow`, no prompt |
| Any other `gh` command: `issue create/edit/comment`, `label create/edit`, `project item-add/item-edit`, `delete`/`close`, `gh api`, `gh alias` | `ask` |
| Contains `; & \| < > $ ( ) { } ^`, a backtick or a newline, or is wrapped (`powershell -c "gh ..."`) | `ask`, never "read" |
| Unparseable hook input | `ask` |

Only `unrelated` and `read` are allowed silently (allow-list in `SILENT_KINDS`); every other
classification asks. There is no separate `deny`: destructive commands also reach the prompt, so the
user sees and can reject them. The prompt is an extra safeguard for commands run through Cursor's
shell tool; it does **not** replace approval of the complete draft, and it is not a boundary for MCP
tools or the user's own terminal.

Requires `node` on the hook's PATH. With `failClosed: true` a missing `node` blocks every `gh`
command (verified: exit code 127 blocked `gh auth status`). Install Node (`.nvmrc`) or, as a
conscious trade-off, set `failClosed` to `false`.

## Testing

Mock stdin only; no GitHub access, nothing executes `gh`. Run all with `npm run test:hooks`
(also part of `pre-push`).

- `hooks/validate-task-handoff.spec.mjs` (Hook 1): valid and invalid briefs, title length, bounded
  corrections, agent identification, ignored or failed runs.
- `hooks/guard-github-commands.spec.mjs` (Hook 2): reads allowed, writes and destructive commands
  ask, chained/piped/substituted/wrapped/path-invoked commands never read-only, unrelated commands
  untouched, bad input asks.

Approval and failure handling are skill instructions, not code, so they are not unit-tested;
review them against the skill files.
