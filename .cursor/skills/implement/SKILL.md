---
name: implement
description: >-
  Orchestrate implementation tasks via requirements-complexity-agent triage,
  then route to spark (simple) or octopus (complex). Use when the user asks to
  implement, build, add, create, fix, or refactor a feature, bug fix, API,
  UI page, CLI command, Cloud Function, or schema change — before writing any
  product code. Never skip triage, even for trivial one-file changes.
---

# Implement

Orchestrate implementation through **mandatory complexity triage** before any
product code is written. Agent definitions live under `.cursor/agents/`.

| Agent                           | Definition                                        | Role                                                   |
| ------------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| `requirements-complexity-agent` | `.cursor/agents/requirements-complexity-agent.md` | Triage only — returns verdict or clarification request |
| `spark`                         | `.cursor/agents/spark.md`                         | Simple, local implementation (product code only)       |
| `octopus`                       | `.cursor/agents/octopus.md`                       | Complex, multi-component implementation (product only) |
| `unit-tests-writer`             | `.cursor/agents/unit-tests-writer.md`             | Post-executor unit tests when classified               |
| `e2e-tests-writer`              | `.cursor/agents/e2e-tests-writer.md`              | Post-executor E2E tests when classified                |

## Hard rules

- **Read this skill first**, then read `.cursor/agents/requirements-complexity-agent.md`
  before launching triage.
- **Never write product code** (Write/Edit on source) until triage completes and
  the chosen executor (`spark` or `octopus`) is running.
- **Never skip triage** — even for one-file or one-button changes.
- **Never launch spark or octopus** without a completed complexity verdict (or
  explicit re-triage after escalation).
- **One executor at a time** — do not run spark and octopus in parallel.
- **Clarification is the parent's job** — if triage returns `NEEDS_CLARIFICATION`,
  ask the user (AskQuestion when available), then re-run triage with answers.
- **Never ask spark or octopus to write or update tests** — do not put
  test-writing instructions in the Step 4 executor prompt. Tests are only
  Step 6 (`unit-tests-writer` and/or `e2e-tests-writer`, or skip).
- **Parent owns test-type routing** — Step 6 classifies unit / e2e / both /
  none from packages, acceptance criteria, and the diff; then launches zero or
  more test writers.
- **No git commit / push** unless the user explicitly asked

Skip this skill only when:

- The user wants Q&A, docs, or review with **no code change**
- Implementation is already mid-flight with a chosen executor and the user is
  continuing that work (not starting a new task).

---

## Workflow

Copy this checklist and track progress:

```
Implement progress:
- [ ] Step 1: Capture task brief
- [ ] Step 2: Run requirements-complexity-agent
- [ ] Step 3: Handle clarification OR parse verdict
- [ ] Step 4: Launch `spark` or `octopus`
- [ ] Step 5: Handle executor outcome (done / escalated / down-escalated)
- [ ] Step 6: Classify needed tests → launch unit-tests-writer and/or e2e-tests-writer (or skip)
- [ ] Step 7: Summarize for the user
```

### Step 1 — Capture task brief

From the user's request, assemble:

- **Goal** — what should exist when done
- **Acceptance criteria** — observable behaviors (infer reasonable defaults if
  obvious; do not invent large new scope)
- **Packages** — `client/`, `functions/`, `cli/`, `shared/`, `wiki/` if relevant
- **Links** — story / FR / issue ids if the user provided them
- **Constraints** — anything the user explicitly ruled in or out

Keep the brief concise; the triage agent scores what is stated plus repo evidence.

### Step 2 — Run requirements-complexity-agent

Launch exactly one `requirements-complexity-agent` subagent:

- `subagent_type: "requirements-complexity-agent"`
- `run_in_background: false`
- `description: "Complexity triage"`

Use this prompt shape:

```text
Full Repository Path: <absolute workspace path>

## Task brief

<goal, acceptance criteria, packages, links, constraints from Step 1>

## CLARIFICATION_ANSWERS

<only when resuming after user answered clarification questions — paste Q→A pairs>
```

Do **not** start coding while triage runs.

If the subagent fails (wrong prompt shape, missing repo path), fix and retry once.
If it fails again, stop and report the blocker to the user.

### Step 3 — Parse triage output

Triage returns **exactly one** of:

#### A) `NEEDS_CLARIFICATION`

1. Present the agent's questions to the user (AskQuestion with 2–4 options per
   question when possible; max 3 questions).
2. Collect answers.
3. Re-run Step 2 with a `CLARIFICATION_ANSWERS` block — do not re-ask answered
   questions.
4. Repeat until verdict or user declines (then stop without implementing).

#### B) Complexity verdict

Look for:

- `**Verdict:** simple` → executor **spark**
- `**Verdict:** complex` → executor **octopus**

Also capture the full verdict block (scores, scope sketch, packages in scope) for
the executor prompt.

If the output is ambiguous (no verdict, no clarification block), re-run triage
once with: "Return exactly one Complexity verdict or NEEDS_CLARIFICATION block."

### Step 4 — Launch executor

Launch exactly one subagent matching the verdict:

| Verdict   | subagent_type | description         |
| --------- | ------------- | ------------------- |
| `simple`  | `spark`       | `Spark implement`   |
| `complex` | `octopus`     | `Octopus implement` |

Prompt shape:

```text
Full Repository Path: <absolute workspace path>

## Original user request

<verbatim or faithful summary of what the user asked for>

## Complexity verdict (from requirements-complexity-agent)

<paste the full triage output block>

## Task brief

<goal, acceptance criteria, packages, constraints>

Do not add or update tests — the parent classifies and runs unit-tests-writer
and/or e2e-tests-writer as needed after you finish.
```

Wait for the executor to finish. Do not implement in the parent in parallel.

### Step 5 — Handle executor outcome

#### Spark result

| Status      | Parent action                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| `done`      | Proceed to Step 6                                                                                              |
| `escalated` | Re-run Step 2 (re-triage) **or** launch `octopus` with spark's escalation context + any partial changes listed |

Prefer re-triage when the escalation changes scope materially; prefer octopus when
spark already identified a clearly complex remainder.

#### Octopus result

| Status           | Parent action                                  |
| ---------------- | ---------------------------------------------- |
| `done`           | Proceed to Step 6                              |
| `blocked`        | Report blocker to user; do not guess around it |
| `down-escalated` | Launch `spark` with octopus's narrowed brief   |

Never silently ignore escalation or down-escalation.

### Step 6 — Classify and run test writers

After a successful executor `done` with product-code changes, **classify** which
tests are needed, then launch zero or more writers. Do not always run unit
tests — simple requests may need none.

#### Classification

Decide from packages touched, acceptance criteria, and the diff:

| Classification | When |
| -------------- | ---- |
| **none** | No product changes; blocked/escalated with nothing worth covering; docs/wiki/ADR-only; trivial copy/layout with no branching and no observable contract (e.g. static label, one-line wiring with no behavior) |
| **unit** | New/changed testable logic in `client/`, `functions/`, `cli/`, or `shared/` (hooks, stores, parsers, handlers, pure utils) that unit tests can protect |
| **e2e** | User-visible flows or UI acceptance in `client/` (list/empty states, auth gates, favorites, share links, multi-step journeys) that need browser + emulator coverage |
| **both** | Both kinds of risk are present (common for API + UI features) |

Record the choice for Step 7: `tests: unit | e2e | both | none — <one-line reason>`.

Skip launching any writer when classification is **none**, or when:

- executor status was `blocked`, or
- escalated / down-escalated with **no** product changes worth covering

Do not ask spark or octopus to write tests instead of this step.

#### Launch order

When both are selected, run **sequentially**: `unit-tests-writer` first, then
`e2e-tests-writer`. Always `run_in_background: false`.

##### `unit-tests-writer`

- `subagent_type: "unit-tests-writer"`
- `description: "Write unit tests"`

```text
Full Repository Path: <absolute workspace path>

## Context

Product implementation just finished via <spark | octopus>. Analyze the current
uncommitted diff, identify meaningful behavior that still lacks unit-test
coverage, and add only the tests necessary to protect that behavior.

Follow your agent instructions (git diff scope, existing patterns, validation
commands). Do not commit.
```

##### `e2e-tests-writer`

- `subagent_type: "e2e-tests-writer"`
- `description: "Write e2e tests"`

```text
Full Repository Path: <absolute workspace path>

## Context

Product implementation just finished via <spark | octopus>. Analyze the current
uncommitted diff, identify meaningful user-visible journeys that still lack E2E
coverage, and add only the Playwright tests necessary to protect those journeys.

Follow your agent instructions (git diff scope, discover Playwright patterns
in-repo, validation commands — npm run test:e2e). Do not commit.
```

### Step 7 — Summarize for the user

Return a short summary:

1. **Triage** — verdict (`simple` / `complex`) in one line
2. **Outcome** — done / escalated / blocked + what changed
3. **Files touched** — key paths from executor and any test writers (not a raw
   dump unless small)
4. **Tests** — `unit | e2e | both | none — <reason>`, plus each writer outcome
   (or "skipped — <reason>")
5. **Checks** — typecheck/lint/tests run and result
6. **Follow-ups** — ADR candidate, manual verification, or commit if the user
   asked

Do not paste entire agent outputs unless the user asks for details.

---

## Re-triage triggers

Re-run `requirements-complexity-agent` when:

- Spark escalates mid-flight
- Scope grows beyond the original verdict's scope sketch
- The user changes requirements materially mid-task

Include prior verdict, executor result, and what broke the assumption in the
new triage prompt.

---

## Examples

### Simple UI button (expected path)

1. User: "Add a button that shows Hello World"
2. Triage → `Verdict: simple`, `Executor: spark`
3. Spark implements in `client/` using ELEKS UI patterns (no tests)
4. Parent classifies → **tests: none** (trivial wiring / no branching contract)
5. Summary: one component + App wiring; no test writers launched

### Pure shared parser (expected path)

1. User: "Add parseShareToken helper in shared/"
2. Triage → `Verdict: simple`, `Executor: spark`
3. Spark implements parser (no tests)
4. Parent classifies → **tests: unit** → `unit-tests-writer`
5. Summary: helper + unit coverage

### Catalog empty-state UI (expected path)

1. User: "Show empty state when the repository list has no items"
2. Triage → `Verdict: simple` or `complex` per scope
3. Executor implements UI (no tests)
4. Parent classifies → **tests: e2e** (and **unit** if logic was extracted) →
   launch matching writers
5. Summary: UI change + E2E journey coverage

### New API + client feature (expected path)

1. User: "Add install tracking endpoint and show count in the UI"
2. Triage → `Verdict: complex`, `Executor: octopus`
3. Octopus: consistency brief → todos → functions + client (product only)
4. Parent classifies → **tests: both** → `unit-tests-writer` then `e2e-tests-writer`
5. Summary: packages touched, both writer outcomes, emulator note if relevant

### Ambiguous request

1. User: "Make repositories better"
2. Triage → `NEEDS_CLARIFICATION` with 2–3 concrete options
3. Parent asks user → re-triage with `CLARIFICATION_ANSWERS`
4. Then route to spark or octopus per new verdict

---

## Quality checklist

Before marking implement complete:

- [ ] Triage ran before any product code
- [ ] Executor matched verdict (`spark` / `octopus`)
- [ ] Executor was not asked to write or update tests
- [ ] Escalation or down-escalation handled explicitly if it occurred
- [ ] Step 6 classification recorded (`unit | e2e | both | none`) with a reason
- [ ] Selected test writers ran (or skip was justified)
- [ ] User got a concise summary with outcome, key paths, and test routing result
- [ ] No commit unless explicitly requested
