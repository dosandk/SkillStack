---
description: >-
  When the user shares a GitHub issue URL or asks to implement a ticket, use
  the implement-issue skill (.cursor/skills/implement-issue/SKILL.md) for the
  full workflow (read issue via GitHub MCP, branch, implement, commit, PR).
alwaysApply: false
---

# GitHub issue implementation

If the message contains a link matching `github.com/{owner}/{repo}/issues/{number}` 
or the user asks to implement/fix/complete a GitHub issue or ticket:

1. Read and follow [implement-issue skill](../skills/implement-issue/SKILL.md).
2. Use GitHub MCP server `project-0-SkillStack-github` for `issue_read` and `create_pull_request`.
3. Do not guess issue type — require labels documented in [contributing.md](../../contributing.md#issue-labels).
4. For commits, follow [git-commit skill](../skills/git-commit/SKILL.md).

Do not start implementation in Ask mode (MCP writes are blocked).
