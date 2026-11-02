---
name: create-github-task
description: >-
  Stages 1-2 of the task workflow: analyze a request, build a Task Brief
  (type, title, description, acceptance criteria), validate it with the
  check script, and get the user's approval. Then hands off to
  publish-github-task. Use when the user asks to add, create, or file a task,
  ticket, issue, or backlog item in dosandk/SkillStack.
---

# Create GitHub task (orchestrator)

Multi-stage workflow: **Analyze -> Approve -> Publish**. This skill owns the first two stages and
delegates the third to `publish-github-task`. Brief format, commands, and guarantees:
[reference.md](reference.md).

## Hard rules

- Never run `gh issue create` or `gh project item-add` yourself. Only the publish script may.
- Never hand off a Brief the user has not explicitly approved.
- One Brief per issue. Propose a split when the request holds several tasks.
- No secrets, `.env` values, or private data in the Brief.

## Stage 1 - Analyze

1. Preflight: `gh auth status`. If `gh` is missing or not logged in, tell the user
   (`brew install gh`, `gh auth login`) and stop. Adding to the board needs the `project` scope:
   `gh auth refresh -s project`.
2. Read the request. Ask the user only for what you cannot infer: type, scope, or acceptance
   criteria. One question at a time.
3. Write the Brief JSON file as described in `reference.md`.
4. Run the `check` command. If it fails, fix the Brief (or tell the user about the duplicate) and
   rerun. Keep the printed `hash`.

## Stage 2 - Approve

Show the Brief as a readable draft (not raw JSON) together with the label:

```markdown
**Type:** <type>   **Label:** <label>
**Title:** <title>

## Description
<description>

## Acceptance criteria
- [ ] <criterion>
```

End with the question "Approve?" and wait. Only an explicit answer to this exact draft is approval
("approve", "yes", "ok", "create"). Silence, questions, or earlier general instructions such as
"follow the plan" are not. On any edit, update the file, rerun `check` for a new hash, show the draft
again, and ask again. The user never needs to see or type the hash.

## Stage 3 - Hand off

Give `publish-github-task` the Brief file path and the hash from the last `check`. When it returns, relay the
issue URL and number to the user.
