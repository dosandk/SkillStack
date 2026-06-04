# Implement Issue — Reference

## GitHub MCP

| Item        | Value                  |
| ----------- | ---------------------- |
| Config file | `.cursor/mcp.json`     |
| Auth        | `GITHUB_TOKEN` env var |

## Issue URL parsing

| Input                                             | Parsed fields                                         |
| ------------------------------------------------- | ----------------------------------------------------- |
| `https://github.com/dosandk/SkillStack/issues/42` | owner=`dosandk`, repo=`SkillStack`, number=`42`       |
| `github.com/foo/bar/issues/7#issuecomment-1`      | owner=`foo`, repo=`bar`, number=`7` (ignore fragment) |

Regex: `github\.com/([^/]+)/([^/]+)/issues/(\d+)`

## Label → branch → commit

Every issue must have at least one label from this table. See `contributing.md` (Issue labels).

| Label           | Task kind      | Branch prefix | Branch example            | Base branch | Commit type | PR checkbox |
| --------------- | -------------- | ------------- | ------------------------- | ----------- | ----------- | ----------- |
| `hotfix`        | production fix | `hotfix`      | `hotfix/99-payment-crash` | `main`      | `fix`       | Bug fix     |
| `bug`           | fix (non-prod) | `feature`     | `feature/12-login-error`  | `develop`   | `fix`       | Bug fix     |
| `enhancement`   | feature        | `feature`     | `feature/42-user-login`   | `develop`   | `feat`      | New feature |
| `documentation` | docs           | `feature`     | `feature/3-update-readme` | `develop`   | `docs`      | Docs update |

**Branch naming:** `{prefix}/{issue_number}-{slug}`

**Label priority** (when multiple recognized labels): `hotfix` > `bug` > `enhancement` > `documentation`

There is no separate `docs/` branch prefix — documentation uses `feature/...` per Git Flow in `contributing.md`.

## Slug rules

From issue **title**:

1. Lowercase
2. Replace spaces and underscores with `-`
3. Remove characters except `a-z`, `0-9`, `-`
4. Collapse repeated hyphens
5. Trim leading/trailing hyphens
6. Truncate to 40 characters

| Title                   | Slug                |
| ----------------------- | ------------------- |
| `Init dev env`          | `init-dev-env`      |
| `Fix: Payment crash!!!` | `fix-payment-crash` |

## `issue_read` calls

```json
{ "owner": "...", "repo": "...", "issue_number": 1, "method": "get" }
{ "owner": "...", "repo": "...", "issue_number": 1, "method": "get_labels" }
{ "owner": "...", "repo": "...", "issue_number": 1, "method": "get_comments" }
```

## `create_pull_request` fields

```json
{
  "owner": "...",
  "repo": "...",
  "title": "feat(wiki): add setup steps",
  "head": "feature/1-init-deve-env",
  "base": "develop",
  "body": "<filled template>"
}
```

## Commit / PR title

Same rules as [git-commit skill](../git-commit/SKILL.md): types `feat`, `fix`, `docs` only; header ≤ 50 chars.

## gh fallback commands

```bash
gh issue view <n> --repo <owner>/<repo>
gh pr create --repo <owner>/<repo> --base develop --head <branch> --title "..." --body "..."
```
