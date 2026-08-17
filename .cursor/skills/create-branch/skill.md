---
name: create-branch
description: >-
  Create a Git Flow branch for a GitHub issue and return issue context to the
  caller. Use when the user asks to create a branch, start work on an issue,
  or checkout a new feature/hotfix branch. Requires a GitHub issue URL or
  reference.
disable-model-invocation: true
---

# Create Branch (SkillStack)

Create a feature or hotfix branch from a **GitHub issue**. Fetch issue metadata,
propose the branch, create it after user confirmation, and **return issue context
to the caller**.

This skill has **one responsibility**: branch creation per Git Flow. It does
not orchestrate implementation, commits, or other workflows — the caller decides
what happens next.

Source of truth: [`contributing.md`](../../../contributing.md) (simplified Git Flow).

## Hard rules

- **GitHub issue required** — extract an issue URL or reference from the user's
  message. If none is present, ask once for a GitHub issue URL or `#N`
  reference. If the user still does not provide one, **stop** and return
  `status: stopped` with reason `issue_required`.
- **Never create a branch without explicit user confirmation** after showing
  the proposed base branch and branch name (e.g. "yes", "create", "ok", or
  approved edits).
- **Never** change `git config`, `git push`, `git push --force`, or use
  `--no-verify`.
- If the working tree is **not clean**, warn the user; do not run `checkout`
  or `pull` without their approval.
- If a local branch with the same name already exists, do not overwrite it —
  propose a different slug or offer to check out the existing branch.
- **Release branches** (`release/{semver}`) are out of scope — handle manually
  if requested.

## Branch naming

Every branch is tied to a GitHub issue.

| Label on issue  | Branch prefix | Base branch | Name format                     | Example                   |
| --------------- | ------------- | ----------- | ------------------------------- | ------------------------- |
| `hotfix`        | `hotfix/`     | `main`      | `hotfix/{issue-number}-{slug}`  | `hotfix/99-payment-crash` |
| `enhancement`   | `feature/`    | `develop`   | `feature/{issue-number}-{slug}` | `feature/42-user-login`   |
| `bug`           | `feature/`    | `develop`   | `feature/{issue-number}-{slug}` | `feature/15-fix-search`   |
| `documentation` | `feature/`    | `develop`   | `feature/{issue-number}-{slug}` | `feature/7-update-readme` |
| No type label   | `feature/`    | `develop`   | `feature/{issue-number}-{slug}` | (warn the user)           |

If multiple type labels apply, use priority: `hotfix` > `bug` > `enhancement` >
`documentation`.

Always include the issue number in the branch name.

### Slug rules

Generate slug from the issue title:

1. Lowercase
2. Strip common prefixes: `[Bug]`, `[Feature]`, `[Hotfix]`, etc.
3. Replace non-alphanumeric characters with `-`
4. Collapse repeated `-`
5. Trim leading/trailing `-`
6. Truncate to **50 characters** (prefer not to cut mid-word)

Allowed characters in slug: `a-z`, `0-9`, `-`.

If the user supplied a custom slug, prefer it over the auto-generated one (still
validate slug rules).

## Workflow

Copy this checklist and track progress:

```
Create-branch progress:
- [ ] Step 1: Resolve GitHub issue reference
- [ ] Step 2: Gather git context
- [ ] Step 3: Fetch issue metadata
- [ ] Step 4: Build branch proposal
- [ ] Step 5: User confirms → create branch (or skip if already on matching branch)
- [ ] Step 6: Return issue context to caller
```

### Step 1 — Resolve GitHub issue reference

Extract from the user's message:

| Input           | Examples                                  |
| --------------- | ----------------------------------------- |
| Issue URL       | `https://github.com/owner/repo/issues/42` |
| Issue reference | `#42`, `issue 42`, `task #42`             |

If no issue is found, ask the user for a GitHub issue URL or `#N` reference.
Do not proceed until an issue is provided or stop with `status: stopped`.

### Step 2 — Gather git context (run in parallel)

```bash
git status                # Show working tree state (clean vs. uncommitted changes)
git branch --show-current # Print the branch currently checked out
git branch -a             # List all branches, local and remote, for collision checks
```

Check whether the proposed branch name already exists locally or on `origin`.

Do **not** run `git fetch` until the user confirms (unless you need remote
branch collision checks and the user already approved fetching).

### Step 3 — Fetch issue metadata

Prefer `gh` against the current repo (`origin` remote):

```bash
gh issue view <number> --json number,title,body,labels,url
```

Fallback: GitHub MCP `issue_read`.

From the issue:

- Use `number` for the branch name segment
- Derive slug from `title` (see slug rules above)
- Map `labels` to branch prefix and base branch
- Keep `body`, `title`, and `url` for the return payload

If the issue cannot be fetched, stop with `status: stopped` and explain why.

### Step 4 — Build proposal (stop here)

Present to the user:

1. **Issue:** number, title, and URL
2. **Base branch:** `develop` or `main`
3. **Branch name:** full name (copy-paste ready)
4. **Warnings** (if any): dirty working tree, missing issue label, name collision

Ask for explicit approval or edits (slug, type, base).

Do **not** run `git checkout`, `git pull`, or `git checkout -b` until the user
confirms.

**Skip branch creation** when the current branch already matches
`feature/{issue-number}-*` or `hotfix/{issue-number}-*` for this issue. Set
`status: already_on_branch` and proceed to Step 6.

### Step 5 — Create branch (only after confirmation)

```bash
git fetch origin                       # Update remote-tracking refs before branching
git checkout develop                   # Switch to the base branch (or main for hotfix)
git pull origin develop                # Fast-forward the base to latest remote (or main)
git checkout -b feature/42-user-login  # Create and switch to the new branch
git status                             # Confirm clean tree on the new branch
git branch --show-current              # Verify the new branch is checked out
```

Use the confirmed base branch and branch name from the proposal.

If the user declines the proposal, stop with `status: declined`.

### Step 6 — Return issue context to caller

Always end by returning this block to the **caller** (parent agent or user):

```markdown
## create-branch result

- **status:** `created` | `already_on_branch` | `declined` | `stopped`
- **issue.number:** <number>
- **issue.title:** <title>
- **issue.url:** <url>
- **issue.body:** <full issue description, or empty>
- **issue.labels:** <comma-separated label names>
- **branch.name:** <current branch name, or null if not created>
- **branch.base:** `develop` | `main` | null
- **stoppedReason:** <only when status is stopped — e.g. issue_required, fetch_failed>
```

The caller uses `issue.body`, `issue.title`, and labels as the task brief for
downstream work. This skill does not define what the caller does next.

## Examples

| User input                                  | Result                                        |
| ------------------------------------------- | --------------------------------------------- |
| Issue #42 "User login", label `enhancement` | `feature/42-user-login` from `develop`        |
| Issue #99 "Payment crash", label `hotfix`   | `hotfix/99-payment-crash` from `main`         |
| Issue #15 "Fix search filter", label `bug`  | `feature/15-fix-search-filter` from `develop` |
| No issue provided, user declines to share   | `status: stopped`, reason `issue_required`    |

## Safety checklist before `git checkout -b`

- [ ] GitHub issue reference resolved (Step 1)
- [ ] User explicitly approved base branch and branch name
- [ ] Branch name follows `feature/{issue-number}-{slug}` or `hotfix/{issue-number}-{slug}`
- [ ] No name collision with existing local or remote branch (or user chose an alternative)
- [ ] User acknowledged dirty working tree warning (if applicable)
- [ ] Base branch matches type: `develop` for `feature/`, `main` for `hotfix/`
