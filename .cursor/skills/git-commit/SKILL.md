---
name: git-commit
description: >-
  Analyze git changes, draft Conventional Commit messages per SkillStack
  commitlint rules, validate with commitlint, and commit only after user
  confirms. Use when the user asks to commit, create a commit, write a commit
  message, or review staged/unstaged changes for committing.
---

# Git Commit (SkillStack)

Follow this workflow when the user wants a commit message, to analyze changes, or to create a commit.

## Hard rules

- **Never commit without explicit user confirmation** after showing the proposed message (e.g. "yes", "commit", "ok", or approved edits).
- **Never** run `git commit --amend`, `git push --force`, or change `git config`.
- **Never** use `--no-verify` / `--no-gpg-sign` unless the user explicitly requests it.
- **Never** stage or commit `.env`, credentials, secrets, or private keys. Warn the user if they appear in the diff.
- Only create commits when the user explicitly asks to commit (or confirms your proposal).

## Commit message format (commitlint)

Enforced by `commitlint.config.mjs` and husky `commit-msg` hook.

| Rule | Value |
|------|--------|
| Types (only these) | `feat`, `fix`, `docs` |
| Type case | lowercase |
| Scope | optional; if present: lowercase kebab-case (e.g. `client`, `wiki`) |
| Header | `type` or `type(scope): subject` — **entire header ≤ 50 characters** |
| Subject | required; lowercase; no trailing `.`; not sentence-case / PascalCase / ALL CAPS |
| Body | optional; **blank line** after header; each line ≤ 72 characters |
| Footer | optional; blank line before footer; lines ≤ 72 characters |

Invalid types (`chore`, `refactor`, `style`, `test`, etc.) **will fail** commitlint.

PR titles should mirror the same format (`contributing.md`).

## Workflow

### 1. Gather context (run in parallel)

```bash
git status
git diff
git diff --cached
git log -10 --oneline
```

For very large diffs, also use `git diff --stat` and read key hunks only.

### 2. Analyze changes

Map changes to **type** and **scope**:

| Change pattern | Type | Scope hint |
|----------------|------|------------|
| New feature or behavior | `feat` | top-level dir: `client`, `wiki`, etc. |
| Bug fix | `fix` | same |
| Documentation only (`.md`, wiki) | `docs` | `wiki` or relevant path segment |

**Scope:** derive from the common directory prefix of changed files (lowercase kebab). Omit scope if changes span unrelated areas.

**Subject:** describe *what* changed from the diff (e.g. `add login validation`), not vague `update` or `fix stuff`.

**Split commits:** if staged/unstaged changes are unrelated (e.g. client feature + wiki typo), propose **multiple commits** with separate messages instead of one generic commit.

Examples:

- Only `wiki/readme.md` → `docs(wiki): clarify setup steps`
- Bugfix under `client/` → `fix(client): prevent empty email submit`
- New UI in `client/` → `feat(client): add user profile tab`

### 3. Draft message

Template:

```text
type(scope): short subject in lowercase

Optional body explaining why (not what files changed).
Wrap at 72 characters per line.
```

Count **header length** (full first line) ≤ 50 before proceeding.

### 4. Validate with commitlint (required before showing user)

Pass the **full message** (header + optional body + footer) to commitlint:

```bash
printf '%s\n' 'feat(client): add login form' '' 'Explain why this change is needed.' | npx --no commitlint
```

If validation fails, fix the message and re-run until it passes.

### 5. Propose to user (stop here)

Present:

1. Full commit message (copy-paste ready)
2. One or two sentences: **why** this type/scope/subject fits the diff
3. List of files to be staged with `git add`
4. Ask for explicit approval or edits

Do **not** run `git add` or `git commit` until the user confirms.

### 6. Commit (only after confirmation)

```bash
git add <relevant-files>   # not git add -A unless user asked
git commit -m "$(cat <<'EOF'
feat(client): add login form

Short body explaining why.

EOF
)"
git status
```

### 7. Hook failures

| Failure | Action |
|---------|--------|
| `commit-msg` / commitlint | Fix message, create a **new** commit (do not amend unless user explicitly asked and HEAD was yours unpushed) |
| `pre-commit` / lint-staged | Fix lint issues, re-propose message, commit again after user confirms |

## Safety checklist before `git add`

- [ ] No `.env` / secrets in the file list
- [ ] Message passed `npx commitlint`
- [ ] User explicitly approved the message
- [ ] Files to stage match what was shown in the proposal
