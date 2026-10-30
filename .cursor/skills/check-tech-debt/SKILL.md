---
name: check-tech-debt
description: >-
  Find and triage technical debt — collects debt signals (TODO/FIXME markers,
  lint and type suppressions, skipped tests, change hotspots), ranks them by
  impact, age and effort, and produces a prioritised report with a decision per
  item: pay now, schedule, or accept. Applies small refactors as separate focused
  commits only after explicit user approval. Use when the user asks to check tech
  debt, clean up a module, plan refactoring, or review what is piling up.
---

# Check Tech Debt

Two-pass debt check: **signal scan** finds the evidence (markers, suppressions,
skipped tests, churn), then a **triage pass** decides what each item deserves.
Report first; change code only after the user approves. Debt that is visible,
ranked, and owned is manageable — debt that hides in comments is not.

## Hard rules

- **Never edit any source before the user approves the plan** (Phase 4 gate).
- Phases 1–3 are read-only — do not modify project files.
- Refactors must preserve behavior; the relevant tests pass before and after.
- **One concern per commit.** Never mix a refactor with a feature or bug fix, and keep
  each change small enough to review on its own.
- Ignore `node_modules` / `lib` / `dist` / generated output and lock files.
- Do not open issues or push anything without the user's explicit go-ahead.

---

## Phase 1 — Scope

Decide what to scan, in this priority order:

1. If the user named a path/module (e.g. "check `functions/src`") — scan that.
2. If the user says "my changes" / "the diff" — scan files from `git diff --name-only`
   and `git diff --cached --name-only`, filtered to `.ts`/`.tsx`/`.js`/`.jsx`.
3. Otherwise scan the project's main source roots (infer from layout / package structure).

State the resolved scope in one line before running anything.

---

## Phase 2 — Signal scan

Run each search on the Phase 1 paths (use `rg`, or `grep -rnE` if it is missing):

```bash
# Markers
rg -n '\b(TODO|FIXME|HACK|XXX)\b' <scope>

# Suppressions (lint and type escapes)
rg -n '(eslint-disable|@ts-ignore|@ts-expect-error|@ts-nocheck|:\s*any\b|\bas any\b)' <scope>

# Skipped or placeholder tests
rg -n '\b(it|test|describe)\.(skip|todo|fixme)\b|\bx(it|describe)\(' <scope>

# Change hotspots — files touched most in the last 6 months
git log --since="6 months ago" --name-only --pretty=format: -- <scope> \
  | grep -v '^$' | sort | uniq -c | sort -rn | head -15
```

For every marker or suppression, get its age with
`git blame -L <line>,<line> --date=short <file>`.

Also note commented-out code blocks and unused exports you notice while reading.

---

## Phase 3 — Triage

Group related signals, then rate each item:

- **Impact** — _blocks change_ (makes nearby work slow or risky), _risk_ (can hide a
  bug), or _cosmetic_.
- **Effort** — S (minutes, one file), M (an hour or a few files), L (needs design or
  touches several modules).
- **Age** — from `git blame`; old and untouched usually means safe to schedule, old
  and in a hotspot means pay now.

Assign one decision per item:

- **Pay now** — small, low-risk, and inside or next to the current change.
- **Schedule** — real but larger; needs a tracked issue with an owner.
- **Accept** — cheaper to live with; record why so it is not re-triaged every time.

Hotspots that are also complex deserve a `check-complexity` run; repeated logic
deserves a `check-duplicates` run. Point to them instead of redoing their work.

---

## Phase 4 — Report

Present a single report. Do not edit anything yet.

## Tech-debt report — <scope>

### Summary

<N items> — <x> pay now · <y> schedule · <z> accept

### Items

| #   | Signal      | Location | Age  | Impact        | Effort | Decision |
| --- | ----------- | -------- | ---- | ------------- | ------ | -------- |
| 1   | FIXME / any | file:LN  | 8 mo | blocks change | S      | Pay now  |

### Proposed changes

List each "pay now" item as its own focused commit, in the order to apply them.
For "schedule" items, give a draft issue title and a two-line description. For
"accept" items, give the one-line reason.

Then ask which items to apply, which to turn into issues, and which to drop.

---

## Phase 5 — Apply (only after approval)

For the items the user approved:

1. Make one focused change at a time and run the tests that cover it.
2. Commit each change separately with a Conventional Commit message (`refactor:`,
   `test:`, or `chore:`); use the `git-commit` skill if available. Follow
   `contributing.md` for branch naming and pull requests.
3. For "schedule" items the user approved, create the issues as drafted, then replace
   the old marker with a `NOTE:` comment that links the issue, following the project's
   comment conventions.
4. For "accept" items, leave a `NOTE:` comment with the reason where the debt lives.

Finish with a short summary: what was fixed, what was filed, what was accepted, and
anything skipped.
