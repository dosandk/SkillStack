---
name: implement-issue
description: >-
  Implements a GitHub issue from a URL: reads issue via GitHub MCP, classifies
  by labels (enhancement, bug, documentation, hotfix), creates a Git Flow
  branch per contributing.md, implements changes, commits via git-commit skill,
  pushes, and opens a PR. Use when the user shares a github.com/.../issues/N
  link or asks to implement a ticket.
disable-model-invocation: true
---

# Implement GitHub Issue

End-to-end workflow: issue URL → read task → branch → implement → commit → push → PR.

Requires **Agent mode** (GitHub MCP is not available in Ask mode).

Quick reference tables: [reference.md](reference.md).

## Hard rules

- **GitHub MCP first** for read and PR create. Config: `.cursor/mcp.json`. Use `gh` only if MCP is unavailable.
- **Never guess issue type** — classification comes from labels only (see reference.md). If no recognized label,
  stop and ask the user to add one.
- **Never commit** without following [git-commit skill](../git-commit/SKILL.md) and explicit user confirmation.
- **Never** run `git commit --amend`, `git push --force`, or change `git config`.
- **Never** stage or commit `.env`, credentials, secrets, or private keys.
- **Never** force-push to `main` or `develop`.
- If the user only asked to plan or review, do not create a branch or change code until they confirm the plan.

## Prerequisites

- `GITHUB_TOKEN` set (see `.cursor/mcp.json`).
- GitHub MCP server connected in Cursor.
- Issue has **exactly one** recognized type label (or multiple with clear priority — see reference.md).
- Long-lived branches `main` and `develop` exist on `origin` (fetch before branching).

## Workflow

### 1. Parse issue URL

Extract from URLs like `https://github.com/{owner}/{repo}/issues/{number}`:

- `owner`, `repo`, `issue_number` (integer)

If the user gives only `#N` or `owner/repo#N`, resolve against the current git remote (`git remote get-url origin`)
when possible.

### 2. Read issue (GitHub MCP)

Call `issue_read` on server in parallel:

| Call       | method         |
| ---------- | -------------- |
| Details    | `get`          |
| Labels     | `get_labels`   |
| Discussion | `get_comments` |

Required arguments: `owner`, `repo`, `issue_number`.

Build an implementation brief from: title, body, labels, and comments (acceptance criteria often live in comments).

### 3. Classify by labels

Apply the label → branch mapping in [reference.md](reference.md).

1. Collect label names (lowercase).
2. If multiple recognized labels, use priority: `hotfix` > `bug` > `enhancement` > `documentation`.
3. If **none** recognized — **stop**. List required labels and link to `contributing.md` (Issue labels section). Do not branch.

Derive **branch name**:

```text
{branchPrefix}/{issue_number}-{slug}
```

- `branchPrefix`: `feature` or `hotfix` (from reference table)
- `slug`: from issue title — lowercase, kebab-case, ASCII letters/numbers/hyphens only, max 40 chars

Example: issue `1` titled `init dev env`, label `enhancement` → `feature/1-init-dev-env`, base `develop`, commit type `feat`.

Present a short **plan** to the user before branching:

- Branch name and base branch
- Commit type (`feat` | `fix` | `docs`) and suggested scope
- Summary of what will be implemented
- Ask for confirmation if requirements are ambiguous

### 4. Create local branch

Use local git (not remote-only `create_branch`):

```bash
git fetch origin
git checkout <base>          # develop or main per classification
git pull origin <base>
git checkout -b <branch-name>
```

If `<base>` does not exist locally, ask the user whether to branch from `main` or create `develop`.

Verify a clean working tree before checkout; stash or warn if there are uncommitted changes.

### 5. Implement

- Satisfy the issue body and relevant comments.
- Minimal diff; match existing project conventions.
- `documentation` label → prefer `wiki/`, `contributing.md`, and other `.md` files.
- Run project checks if they exist (e.g. `npm test`, lint) before commit.

### 6. Commit (git-commit skill)

Read and follow [`.cursor/skills/git-commit/SKILL.md`](../git-commit/SKILL.md) end-to-end. Do not invent a separate commit format.

- Use the **commit type** from classification (`feat`, `fix`, or `docs`).
- PR title will mirror the commit header (≤ 50 characters, commitlint rules in `commitlint.config.mjs`).
- Commit only after user confirms the proposed message.

### 7. Push

```bash
git push -u origin HEAD
```

### 8. Create pull request (GitHub MCP)

Call `create_pull_request`

| Field           | Value                                        |
| --------------- | -------------------------------------------- |
| `owner`, `repo` | from URL                                     |
| `title`         | same as commit header                        |
| `head`          | branch name (e.g. `feature/1-init-deve-env`) |
| `base`          | `develop` or `main` per classification       |
| `body`          | filled PR template (below)                   |

**PR body template** (from `.github/PULL_REQUEST_TEMPLATE.md`):

```markdown
## Linked ticket

Closes #<issue_number>

---

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Docs update

---

## What was changed

<2–5 sentences from implementation>

---

## How to test

1. ...
2. ...
```

Check the correct **Type of change** box from classification (`prCheckbox` in reference.md).

Fallback if MCP fails:

```bash
gh pr create --base <base> --head <branch> --title "<title>" --body-file <tmp.md>
```

Return the PR URL to the user.

## MCP tool summary

| Step       | Tool                  |
| ---------- | --------------------- |
| Read issue | `issue_read`          |
| Open PR    | `create_pull_request` |

## Hook failures

| Failure                   | Action                                                              |
| ------------------------- | ------------------------------------------------------------------- |
| `pre-push` / tests        | Fix code, re-run tests, push again                                  |
| `commit-msg` / commitlint | Fix message via git-commit workflow; new commit after user confirms |
| MCP auth error            | Verify `GITHUB_TOKEN`; reload MCP in Cursor settings                |

## Out of scope (v1)

- Assigning GitHub Coding Agent
- Sub-issues unless user explicitly asks
- Auto-fixing CI (use babysit skill separately)
- Release branches (`release/{semver}`)

## Example invocation

```text
Implement issue https://github.com/dosandk/SkillStack/issues/1
```

Or: «use skill implement-issue for #1».
