---
name: refactor-candidates
description: >-
  Find code worth refactoring by combining git change frequency (churn) with
  size and complexity signals, then produce a prioritised, read-only report.
  Applies refactors only after explicit user approval. Use when the user asks
  where to refactor, what to clean up first, to find hotspots, or to plan
  refactoring.
---

# Refactor Candidates

Finds **hotspots**: files that are both changed often and hard to read. Refactoring
code nobody touches has little payoff; refactoring code that changes every week
pays back quickly. Report first; refactor only after the user approves.

## Hard rules

- Phases 1-4 are **read-only**. Do not modify any file before the user approves a candidate.
- Refactor **one candidate at a time**, preserving behavior, in a small focused change.
- Do not mix refactoring with feature work or unrelated fixes.
- Ignore `node_modules`, `lib`, `dist`, `coverage`, lockfiles, and generated output.
- If a candidate has no tests, say so and propose adding tests before refactoring.

## Phase 1 - Scope

Resolve the scope in this order and state it in one line:

1. A path or module named by the user (e.g. `functions/src`).
2. "My changes": files from `git diff --name-only` and `git diff --cached --name-only`.
3. Otherwise `client/src`, `functions/src`, `cli/src`, `shared`.

Only `.ts`, `.tsx`, `.js`, `.jsx` files.

## Phase 2 - Churn

Count commits per file over the last 6 months within the scope:

```bash
git log --since="6 months ago" --name-only --pretty=format: -- <scope> \
  | grep -E '\.(ts|tsx|js|jsx)$' | sort | uniq -c | sort -rn | head -20
```

If the history is shallow or empty, say so and continue with size signals only.

## Phase 3 - Signals

For the top churned files plus any very large file in scope, check:

| Signal               | What to look for                                                           |
| -------------------- | -------------------------------------------------------------------------- |
| Size                 | File over ~300 lines, function over ~50 lines                              |
| Complexity           | Deep nesting, long boolean chains, many branches (use `npx eslint <file>` SonarJS findings if configured) |
| Mixed responsibility | HTTP, domain, and data access in one unit (`single-responsibility.mdc`)    |
| Duplication          | Near-identical blocks across files                                         |
| Long parameter lists | More than ~4 parameters, boolean flags changing behavior                   |
| Dead code            | Unused exports, commented-out code, unreachable branches                   |
| Speculative code     | Abstractions with one implementation, unused options (`yagni.mdc`)         |
| Debt markers         | `TODO`, `FIXME`, `HACK`, `@ts-ignore`, `eslint-disable`                    |

Read the file before judging it. Do not report a signal you did not see in the code.

## Phase 4 - Report

Rank by **priority = churn x number and severity of signals**. Show at most 10 rows:

| # | File | Commits (6m) | Signals | Suggested refactor | Effort | Tests |
|---|------|-------------:|---------|--------------------|--------|-------|
| 1 | path/to/file.ts | 14 | 420 lines, mixed responsibilities | Split handler/domain/store | M | yes/no |

Below the table, add 1-2 sentences per top-3 candidate explaining why it matters.

Then ask which candidate to refactor (or none). Do not start without an answer.

## Phase 5 - Refactor (only after approval)

1. Confirm existing tests pass (or add characterisation tests first if none exist).
2. Make the smallest change that removes the chosen signal.
3. Re-run tests and lint for the touched package.
4. Show the diff summary and suggest a commit with the `git-commit` skill
   (`fix` or `feat` type only; commitlint does not allow `refactor`).
5. Offer to continue with the next candidate; keep each one a separate change.
