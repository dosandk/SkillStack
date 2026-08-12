---
name: check-complexity
description: >-
  Detect high function size and complexity — runs ESLint SonarJS on a chosen
  scope (cognitive complexity, nested conditionals, function size), reviews
  hotspots, and produces a prioritised report. Applies refactors only after
  explicit user approval. Use when the user asks to check complexity, find
  complex functions, or simplify a module.
disable-model-invocation: true
---

# Check Complexity

Two-pass complexity check: **ESLint + SonarJS** finds metric violations, then a
**hotspot review** notes structural issues the metrics under-report. Report
first; refactor only after the user approves.

## Hard rules

- **Never edit any source before the user approves the refactor plan** (Phase 4 gate).
- Phases 1–3 are read-only — do not modify project files.
- Refactors must preserve behavior.
- Ignore `node_modules` / `lib` / `dist` / generated output.

---

## Phase 1 — Scope

Decide what to scan, in this priority order:

1. If the user named a path/module (e.g. "check `functions/src`") — scan that.
2. If the user says "my changes" / "the diff" — scan files from `git diff --name-only`
   and `git diff --cached --name-only`, filtered to `.ts`/`.tsx`/`.js`/`.jsx`.
3. Otherwise scan the three source roots: `client/src`, `functions/src`, `cli/src`.

State the resolved scope in one line before running anything.

---

## Phase 2 — ESLint SonarJS

Run eslint on the Phase 1 paths using the project config (do not pass `--rule` overrides):

```bash
npx eslint <scope paths from Phase 1>
```

Keep only complexity-related findings (rule ids containing `complexity`, `nested`, or `max-lines` under `sonarjs/`, plus any other SonarJS size/complexity rules the project config enables). Ignore unrelated lint noise. Thresholds and enabled rules come from the ESLint config at the project root (`eslint.config.js`, `eslint.config.mjs`, or `.eslintrc.*`) — do not hardcode them in this skill.

---

## Phase 3 — Light hotspot review

For the worst tool hits (and any very large in-scope files), skim the function and note structural issues lint under-reports: mixed responsibilities, deep nesting that still scores low, long boolean chains, render paths doing too much. Do not re-lint the whole tree by hand.

---

## Phase 4 — Report

Present a single report. Do not edit anything yet.

## Complexity report — <scope>

### Tool findings (ESLint SonarJS) — <count>

| #   | Symbol | File | Rule | Note | Suggested fix |
| --- | ------ | ---- | ---- | ---- | ------------- |
| 1   | ...    | ...  | ...  | ...  | ...           |

### Structural notes (agent) — <count>

| #   | Issue | Location | Suggested fix |
| --- | ----- | -------- | ------------- |
| 1   | ...   | ...      | ...           |

### Recommendation

- High value / low risk to simplify: #...
- Leave as-is (justified / low payoff): #...

Then ask which items (if any) to refactor. **Stop here until the user chooses.**
