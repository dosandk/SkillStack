---
name: publish-github-task
description: Publish an already approved GitHub issue draft to dosandk/SkillStack and project #10, then verify the result. Use only as Stage 3 of create-github-task, after the user explicitly approved the complete draft and action plan.
---

# Publish an approved GitHub task

Executed by the parent agent (no subagent) with `gh`. Constants: repo `dosandk/SkillStack`,
project owner `dosandk`, project number `10`.

## Precondition: approval

Proceed only if **all** hold; otherwise stop and return to `create-github-task`:

- The user answered yes/ok in a separate reply **after** the complete draft and action list.
- The draft you are about to publish is identical to the one approved (edits cancel approval).
- Target repo and project are the constants above.

Execute only the approved actions, in this order. Any extra write (e.g. a label that was not
listed) needs a new approval. Never delete or close issues.

## 1. Missing label (only if approved in the plan)

```powershell
gh label create <label> -R dosandk/SkillStack
```

## 2. Create the issue

Pass the body on stdin (no temp file, no quoting problems). Add `--assignee <login>` only if approved.

```powershell
$url = $body | gh issue create -R dosandk/SkillStack --title "<title>" --body-file - --label <label>
```

Save `$url` and the issue number immediately. If the command errors, **do not retry**: go to
"Ambiguous create failure".

## 3. Add to the project

```powershell
gh project item-add 10 --owner dosandk --url $url
```

## 4. Verify (read-only)

```powershell
gh issue view <number> -R dosandk/SkillStack --json number,url,title,labels,assignees,projectItems
```

Check: issue exists in `dosandk/SkillStack`, title and label match the draft, assignee matches if
requested, and `projectItems` contains project `10`. Report project membership only if verified.

## Failure handling

- **Project add failed:** the issue exists - keep its URL and never recreate it. Check whether
  project automation already added it (`projectItems` above). If not, report `PARTIAL_SUCCESS`,
  propose only `gh project item-add ...`, and get a separate approval before retrying.
  Missing `project` scope: ask the user to run `gh auth refresh -s project`.
- **Ambiguous create failure:** inspect first
  (`gh issue list -R dosandk/SkillStack --search "in:title <title>" --state open --json number,title,url`).
  If the issue exists, continue from step 3 with it. If it cannot be identified reliably, stop and
  ask the user. Never repeat `gh issue create` automatically.
- **Label create failed:** stop before creating the issue and report.

## Result

```json
{
  "status": "SUCCESS | PARTIAL_SUCCESS | FAILED",
  "issueNumber": 123,
  "issueUrl": "https://github.com/dosandk/SkillStack/issues/123",
  "label": "enhancement",
  "projectAdded": true,
  "remainingActions": []
}
```

Illustrative shape only, not a real issue. Return it to the orchestrator.
