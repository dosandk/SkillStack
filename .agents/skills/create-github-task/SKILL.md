---
name: create-github-task
description: >-
  Create a new task (GitHub issue) in dosandk/SkillStack and add it to the
  GitHub Project board (user project 10) using the GitHub CLI. Use when the
  user asks to add, create, or file a task, ticket, issue, or backlog item.
---

# Create GitHub task (SkillStack)

Turns a user request into a GitHub issue in `dosandk/SkillStack` and puts it on the project board
`https://github.com/users/dosandk/projects/10`.

## Hard rules

- **Never create the issue without explicit user confirmation** of the final title and body.
- Use only the `gh` CLI. Do not call the GitHub API with raw tokens.
- Never put secrets, `.env` values, or private data in the title or body.
- Create **one** issue per task. If the request describes several tasks, propose a split and
  confirm it first.
- Do not edit or close existing issues unless the user asks.

## Constants

| Name       | Value                |
| ---------- | -------------------- |
| Repository | `dosandk/SkillStack` |
| Project    | `10` (owner `dosandk`) |

## Workflow

### 1. Preflight

```bash
gh --version
gh auth status
```

- `gh` missing: tell the user to install it (`brew install gh`) and stop.
- Not logged in: ask the user to run `gh auth login`.
- Project access needs the `project` scope. If `gh auth status` does not list it, ask the user to
  run `gh auth refresh -s project`.

### 2. Gather the task

Collect from the request, asking only for what is missing:

- **Title**: imperative, short, no trailing period (e.g. `Add skill for creating GitHub tasks`).
- **Description**: what and why, in 2-5 sentences.
- **Acceptance criteria**: checklist of verifiable outcomes.
- **Labels** (optional): only labels that exist. Check with `gh label list -R dosandk/SkillStack`.
- **Assignee** (optional): GitHub login, or `@me`.

### 3. Draft and confirm

Show the draft and wait for approval:

```markdown
**Title:** <title>
**Labels:** <labels or none>
**Assignee:** <login or none>

## Description
<description>

## Acceptance criteria
- [ ] <criterion>
- [ ] <criterion>
```

### 4. Create the issue

Write the body to a temp file to avoid shell-quoting problems, then create the issue:

```bash
BODY_FILE="$(mktemp)"
cat > "$BODY_FILE" <<'EOF'
<approved body>
EOF

gh issue create -R dosandk/SkillStack \
  --title "<approved title>" \
  --body-file "$BODY_FILE" \
  [--label "<label>"] [--assignee "<login>"]

rm -f "$BODY_FILE"
```

`gh issue create` prints the issue URL. Keep it.

### 5. Add to the project board

```bash
gh project item-add 10 --owner dosandk --url <issue-url>
```

If this fails with a permission error, ask the user to run `gh auth refresh -s project` and retry
once.

### 6. Report

Reply with the issue URL, the number (`#<n>`), and confirmation that it was added to the project.
Mention the issue number as the branch/PR reference: branches follow
`{type}/{issue-number}-{slug}` (see `contributing.md`), and PRs use `Closes #<n>`.

## Failure handling

- Issue created but project add failed: report the issue URL, say the project step failed with the
  error text, and give the exact `gh project item-add` command for the user to retry.
- Never create a second issue to retry; check first with
  `gh issue list -R dosandk/SkillStack --search "<title>" --state all`.
