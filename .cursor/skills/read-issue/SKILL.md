---
name: read-issue
description: >-
  Reads a GitHub issue from the current repository by its number via the gh
  CLI. Use when the user references an issue number (e.g. "#42", "issue 42")
  and asks to read, open, show, summarize or work on that issue.
---

# Read Issue by Number

Run from the repo root; `gh` resolves the current repository from the git remote.

```bash
gh issue view <number> --comments
```

For structured output, use:

```bash
gh issue view <number> --json number,title,state,author,labels,assignees,body,comments,url
```

If `gh` is not authenticated, stop and ask the user to run `gh auth login`.
If the issue is not found, tell the user and confirm the number.
