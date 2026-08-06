---
name: check-duplicates
description: >-
  Detect duplicated code in the SkillStack monorepo — runs jscpd for exact
  copy-paste blocks, then does a semantic review for logic that is duplicated
  under different names, and produces a prioritised report. Applies refactors
  (extract shared helper) only after explicit user approval. Use when the user
  asks to check for duplicate code, find copy-paste, or deduplicate a module.
---

# Check Duplicates

Twoz-pass duplication check: **jscpd** finds token-level copy-paste, then a
**semantic pass** finds the same logic written differently (renamed variables,
reordered branches, parallel Zod schemas, near-identical handlers). Report first;
refactor only after the user approves.

## Hard rules

- **Never edit any source before the user approves the refactor plan** (Phase 4 gate).
- Report is read-only: Phases 1–3 must not modify project files.
- Refactors must preserve behavior — no signature or output changes beyond extraction.
- Extracted code follows the [naming-convention rule](../../rules/naming-convention.mdc)
  and any comment added must start with `NOTE:` per the [code-comments rule](../../rules/code-comments.mdc).
- Do not treat generated output, lock files, or `node_modules`/`lib`/`dist` as duplication.
- Delegate the commit to the [git-commit skill](../git-commit/SKILL.md); never invent a commit format.

---

## Phase 1 — Scope

Decide what to scan, in this priority order:

1. If the user named a path/module (e.g. "check `functions/src`") — scan that.
2. If the user says "my changes" / "the diff" — scan files from `git diff --name-only`
   and `git diff --cached --name-only`, filtered to `.ts`/`.tsx`/`.js`/`.jsx`.
3. Otherwise scan the three source roots: `client/src`, `functions/src`, `cli/src`.

State the resolved scope in one line before running anything.

---

## Phase 2 — Textual duplication (jscpd)

Run jscpd via `npx`:

```bash
npx --yes jscpd \
  --min-tokens 50 \
  --min-lines 5 \
  --reporters json,console \
  --ignore "**/node_modules/**,**/lib/**,**/dist/**,**/package.json,**/package-lock.json" \
  --output .jscpd-report \
  <scope paths from Phase 1>
```

---

## Phase 3 — Semantic duplication (agent review)

jscpd misses logic that was rewritten, not copied. Read the in-scope files and look for:

- **Parallel functions/handlers** — same steps (fetch → validate → write) with different names.
- **Duplicated validation** — repeated Zod schemas or guard blocks describing the same shape.
- **Copy-adapted utilities** — a helper reimplemented instead of imported (parsers, formatters, mappers).
- **Repeated Firestore access patterns** — the same query/update shape across handlers.
- **Cross-package drift** — the same type or constant defined separately in different modules.

---

## Phase 4 — Report

Present a single report. Do not edit anything yet.

## Duplication report — <scope>

### Exact clones (jscpd) — <count>

|  #  | Fragment (what it does) | Location A | Location B | Lines | Suggested fix  |
| :-: | :---------------------- | :--------- | :--------- | :---- | :------------- |
|  1  | ...                     | file:LX-LY | file:LX-LY | N     | extract to ... |

### Semantic duplicates — <count>

| #   | Duplicated logic | Locations | Suggested shared home |
| --- | ---------------- | --------- | --------------------- |
| 1   | ...              | ...       | ...                   |

### Recommendation

- High value / low risk to dedupe: #...
- Leave as-is (coincidental / cheaper duplicated): #...

Rank by payoff: prefer extractions that remove real logic over cosmetic ones.
Then ask which items (if any) to refactor. **Stop here until the user chooses.**
