---
name: github-add-task
description: "Add a new task (draft issue) to dosandk's GitHub Project board (https://github.com/users/dosandk/projects/10/views/1). Use when the user asks to create, add, or file a new GitHub task, issue, or ticket for this project."
---

# Add a GitHub Task

Creates a new task on the GitHub Projects (v2) board at
[dosandk/projects/10](https://github.com/users/dosandk/projects/10/views/1)
(owner `dosandk`, project number `10`) as a draft issue item, using the
GitHub CLI (`gh`).

## When to use this

The user asks you to create/add/file a new task, issue, or ticket for this
project (e.g. "add a task for the login bug", "create a new GitHub issue
about...").

## Steps

1. **Check prerequisites once per session.** Confirm `gh` is installed and
   authenticated with the `project` scope:

   ```bash
   gh auth status
   ```

   If it's missing, tell the user to run:

   ```bash
   gh auth login --web -s project
   ```

   (or, if already logged in without the scope: `gh auth refresh -s project`).
   Don't attempt to author tasks until this succeeds.

2. **Prompt the user in chat** for exactly these four pieces of information,
   one message, asking for all four together is fine:
   - **Title** — short task title.
   - **Summary** — one or two sentence overview.
   - **Details** — longer free-form description, context, repro steps, etc.
   - **Acceptance criteria** — tell the user explicitly to separate multiple
     criteria with a semicolon (`;`), e.g.
     `"Login works with SSO; Error is logged; Regression test added"`.

   Only Title is strictly required to proceed; Summary, Details, and
   Acceptance Criteria may be left blank if the user has nothing to add, but
   always ask for all four.

3. **Run the helper script** with the answers as arguments (do not try to
   reimplement the `gh` call inline — the script handles AC splitting, body
   formatting, and error handling):

   ```bash
   .cursor/skills/github-add-task/scripts/add_task.sh \
     --title "<title>" \
     --summary "<summary>" \
     --details "<details>" \
     --ac "<item 1>; <item 2>; <item 3>"
   ```

   Omit any of `--summary`, `--details`, `--ac` the user left blank. Use
   `--dry-run` first if you want to preview the generated task body before
   actually creating it.

4. **Report back** the created item's URL from the script's output (or the
   error message if it failed) to the user.

## Notes

- The script turns the acceptance criteria into a GitHub task checklist
  (`- [ ] item`), one line per `;`-separated entry, trimmed of surrounding
  whitespace.
- This creates a **draft issue item directly on the project board**, not an
  issue in a specific repository — matching how a user-level
  Projects (v2) board like this one is normally used. If the user instead
  wants a real repository issue linked into the project, ask which repo and
  use `gh issue create --repo <owner>/<repo> ...` followed by
  `gh project item-add`, instead of this script.
- To target a different owner/project (e.g. testing), pass `--owner` and
  `--project`, or set `GH_PROJECT_OWNER` / `GH_PROJECT_NUMBER`.
- Full flag reference: `.cursor/skills/github-add-task/scripts/add_task.sh --help`.
