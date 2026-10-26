---
name: create-github-task
description: Create a new GitHub issue/task in dosandk/SkillStack and add it to the GitHub Project board (users/dosandk/projects/10). Use when the user asks to add, create, or file a task, ticket, issue, bug, or feature request.
---

# Create a GitHub task

Creates an issue in `dosandk/SkillStack` and adds it to project
[#10](https://github.com/users/dosandk/projects/10/views/1) using the GitHub CLI (`gh`).

Constants: repo `dosandk/SkillStack`, project owner `dosandk` (user project), project number `10`.

## Hard rule: confirm before writing to GitHub

Anything that creates or changes something on GitHub (issue, label, project item, board field,
comment, closing an issue) requires an explicit "yes" / "ok" from the user, given in a **separate
reply after** the full draft was shown. Vague phrases ("let's try", "test it") are not approval.
This applies to test issues too. Read-only commands (`gh auth status`, `gh label list`,
`gh issue list`, `gh repo view`, `gh project view`) need no confirmation.

## Workflow

### 1. Gather input

- **Title** - concise, imperative (e.g. "Add install count to skill card").
- **Description** - what and why.
- **Label** - infer from the request, ask if unclear. Allowed labels, branch types and base
  branches are defined in [contributing.md](../../../contributing.md) ("Github issue labels"):

  | Label                                | Branch prefix | Base branch |
  | ------------------------------------ | ------------- | ----------- |
  | `enhancement`, `bug`, `documentation` | `feature/`    | `develop`   |
  | `hotfix`                             | `hotfix/`     | `main`      |

- Optional: assignee, acceptance criteria.

### 2. Preflight (read-only, before drafting)

Run these and stop with clear instructions if something fails:

```powershell
gh auth status
gh repo view dosandk/SkillStack --json viewerPermission
gh label list -R dosandk/SkillStack --limit 100
gh issue list -R dosandk/SkillStack --search "<keywords>" --state open
```

- `gh` missing: ask the user to run `winget install --id GitHub.cli`, restart the terminal, then `gh auth login`.
- Token lacks the `project` scope: ask the user to run `gh auth refresh -s project` (browser/device flow).
- Label missing: it must be created later (with approval) - mention it in the draft.
- `viewerPermission` is `READ`: the issue can be created, but labels will not be applied and
  `gh project item-add` may fail - mention it in the draft.
- Likely duplicate found: show it to the user in the draft.

### 3. Show the draft and STOP

Post one message with: target repo, title, label, assignee (if any), the complete body, the
preflight findings (duplicates, missing label, permission limits), and the full list of actions
that approval will trigger (create label if missing, create issue, add to project #10).
Then **stop** - run no create/edit command in the same turn. If the user asks for changes, update
the draft, show it again and wait again.

Write the draft and the issue itself in English.

Body template (feature / improvement / docs):

```markdown
## Summary

<one or two sentences>

## Details

<context, links>

## Acceptance criteria

- [ ] <criterion>
```

For `bug`, replace "Acceptance criteria" with `## Steps to reproduce`, `## Expected` and `## Actual`.

### 4. Create (only after approval)

Pipe the body via stdin (no temp file, no quoting problems). Create the missing label first only
if it was part of the approved draft (`gh label create <label> -R dosandk/SkillStack`).

```powershell
$url = $body | gh issue create -R dosandk/SkillStack --title "<title>" --body-file - --label <label>
gh project item-add 10 --owner dosandk --url $url
```

Add `--assignee <login>` to `gh issue create` if the user asked for one.

If `item-add` fails, check whether the project auto-added the issue
(`gh issue view <number> -R dosandk/SkillStack --json projectItems`) and report the real outcome.

### 5. Report back

- Issue URL and number
- Label applied
- Whether it is on project #10
- Suggested branch: `feature/<number>-<slug>` from `develop`, or `hotfix/<number>-<slug>` from `main`

## Optional: set board fields (e.g. Status)

Only when the user asks. Show the field and value, get approval, then run `item-edit`.

```powershell
gh project view 10 --owner dosandk --format json        # PROJECT_ID
gh project field-list 10 --owner dosandk --format json  # FIELD_ID, OPTION_ID
gh project item-list 10 --owner dosandk --format json   # ITEM_ID
gh project item-edit --project-id <PROJECT_ID> --id <ITEM_ID> --field-id <FIELD_ID> --single-select-option-id <OPTION_ID>
```

## Guardrails

- Do not close or delete an issue you created without asking first.
- Only touch GitHub; do not commit or modify repo files.
