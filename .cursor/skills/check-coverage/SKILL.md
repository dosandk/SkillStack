---
name: check-coverage
description: >-
  Runs coverage for the project, parses branch-first metrics per module,
  compares against repo thresholds, and recommends targeted tests. 
  Use when the user asks to check coverage, test
  coverage gaps, or whether coverage thresholds pass.
---

# Check Coverage

Read-only coverage audit for SkillStack. Run Vitest with `--coverage`, parse the
report, and recommend tests — **branch % is the primary metric**.

## Workflow

Copy this checklist to track progress. Show step completion in the main output.

```
Coverage check progress:
- [ ] Step 1: Resolve scope
- [ ] Step 2: Run coverage commands (per module)
- [ ] Step 3: Parse output (summary + per-file + edge cases)
- [ ] Step 4: Branch-first analysis
- [ ] Step 5: Draft recommendations
- [ ] Step 6: Publish report + overall verdict
```

## Hard rules

- **Read-only** — do not edit source, add tests, or commit unless the user asks.
- **Branch first** — sort gaps, verdicts, and recommendations by `% Branch` (lowest first).
- **Per-module reports** — never merge cli/functions into the root vitest run; each package has its own config.
- **Use actual command output** — do not guess percentages; run the commands below.

## Repo thresholds

Defined in root `vitest.config.ts` (apply to **all** packages unless a package config overrides):
When a metric is within **2 percentage points** of its minimum, mark the module **At risk**.

---

## Phase 1 — Scope

Resolve scope in this priority order:

1. User names a module (`client`, `shared`, `functions`, `cli`) — run only that module's command(s).
2. User names changed files / diff — run all modules, but **focus recommendations on changed source files**
   (exclude `*.spec.*`, configs, type-only re-exports).
3. Otherwise — run **all four modules** (full project audit).

State the resolved scope in one line before running commands.

---

## Phase 2 — Run coverage

Run from the **repo root** unless noted.
Capture stdout (table + summary).
On non-zero exit, still parse partial output and note the failure.

| Module        | Command                                     |
| ------------- | ------------------------------------------- |
| **shared**    | `npm run test:coverage -- --project shared` |
| **client**    | `npm run test:coverage -- --project client` |
| **functions** | `cd functions && npm run test:coverage`     |
| **cli**       | `cd cli && npm run test:coverage`           |

Run independent module commands **in parallel** when possible.

Optional shortcut when only client+shared matter: `npm run test:coverage`
at repo root — then split rows by path prefix (`client/` vs `shared/`).
Prefer per-project commands for a clean module breakdown.

---

## Phase 3 — Parse output

### 3a — Extract summary block

From each run, read the **Coverage summary** footer:

```text
Branches     : 88.23% ( 30/34 )
Statements   : 100% ( 29/29 )
Functions    : 100% ( 10/10 )
Lines        : 100% ( 28/28 )
```

Record `percent`, `covered`, and `total` for each metric.
**Branches row is mandatory** for every module.

### 3b — Extract per-file table

From the `Coverage report` table, collect for each source file:

- Path (may be truncated with `...` — resolve from context or re-run with wider terminal if ambiguous)
- `% Branch`, `% Stmts`, `% Funcs`, `% Lines`
- `Uncovered Line #s` (especially when branch < threshold)

Map paths to modules:

| Path prefix                           | Module    |
| ------------------------------------- | --------- |
| `client/`                             | client    |
| `shared/`                             | shared    |
| `functions/` or under `functions/src` | functions |
| `cli/` or under `cli/src`             | cli       |

### 3c — Handle edge cases

| Situation                                     | Interpretation                                                                                                          |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Unknown% ( 0/0 )` for all metrics            | No instrumented files — flag **No coverage data**; recommend adding `coverage.include` in that package's vitest config. |
| Summary passes but file rows show branch gaps | Module **At risk** — line coverage can hide untested branches.                                                          |
| Vitest exits 1 on thresholds                  | Report which metric failed; branch failure is highest priority.                                                         |
| Truncated filenames                           | Match by suffix (e.g. `...ry-filters.ts` → search module tree) before recommending tests.                               |

---

## Phase 4 — Branch-first analysis

For each module:

1. Compare **branch %** to the defined threshold → Pass / At risk / Fail / No coverage data.
2. List files with **branch < threshold**, sorted ascending by branch %.
3. For each gap file, inspect `Uncovered Line #s` — typical branch gaps:
   - ternary / `??` / `\|\|` fallbacks
   - `if/else` where only one path is tested
   - `switch` / early returns
   - error paths and validation failures
4. Then check lines, functions, statements for the same module.

Cross-module ranking: sort all sub-threshold **files** by branch % globally when recommending what to fix first.

---

## Phase 5 — Recommendations

For each branch gap (or at-risk file), suggest **concrete** next steps:

- **Test type**: colocated `*.spec.ts` / `*.spec.tsx` (preferred),
  `*.i.spec.ts` for Firestore integration in `functions/`, Playwright `*.e2e.ts` only for full UI journeys.
- **Behavior to assert**: name the untested branch (e.g. "empty filter array", "invalid query param", "store returns null").
- **File to extend or create**: mirror source path (`foo.ts` → `foo.spec.ts` beside it).
- **Do not** recommend testing Zod schemas in isolation — test through the function that consumes the schema (repo convention).

Prioritize recommendations:

1. Module failing branch threshold
2. Module at risk on branch
3. Files in scope (diff) with lowest branch %
4. Remaining sub-threshold files

---

## Phase 6 — Report

Use this template:

```markdown
## Coverage report — <scope>

### Module summary (branch-first)

| Module    | Branch         | Status           | Lines | Funcs | Stmts | Tests run |
| --------- | -------------- | ---------------- | ----- | ----- | ----- | --------- |
| client    | 85.71% (24/28) | At risk          | …     | …     | …     | pass/fail |
| shared    | 100% (6/6)     | Pass             | …     | …     | …     | pass/fail |
| functions | 87.5% (7/8)    | Pass             | …     | …     | …     | pass/fail |
| cli       | Unknown        | No coverage data | …     | …     | …     | pass/fail |

### Branch gaps (priority order)

| #   | Module | File | Branch | Uncovered lines | Likely missing branches |
| --- | ------ | ---- | ------ | --------------- | ----------------------- |
| 1   | client | …    | 85.71% | 27,38,66-67     | …                       |

### Recommendations

1. **[client] `client/src/lib/repository-filters.ts`** — add unit cases for … (branch coverage).
2. …

### Overall verdict

**Pass** | **At risk** | **Fail** — one-line justification citing branch metrics first.
```

### Verdict rules

- **Fail** — any in-scope module below branch threshold
- **At risk** — all modules less branch threshold within 5% of a threshold
- **Pass** — all modules meet thresholds; no material branch gaps in scope.
- **No coverage data** for a module counts as **Fail** for full audits; note it explicitly for scoped cli-only runs.

---

## Examples

**Full audit trigger:** "check coverage" / "перевір coverage"

→ Phase 1: full project → run all four commands in parallel → report all modules → branch gaps first.

**Module trigger:** "check coverage for functions"

→ Run only `npm run test:coverage --prefix functions` → report functions row + its branch gaps.

**Diff trigger:** "coverage for my changes"

→ `git diff --name-only` + cached → map files to modules → run relevant commands → recommendations only for changed source files, still ordered by branch %.
