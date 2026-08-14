---
name: implement
description: >-
  Mandatory gate for product and feature implementation. Read and follow this
  skill before Write/Edit/Delete on product source whenever the user wants to
  develop, change, add, fix, update, remove, refactor, configure, style, wire,
  or improve project behavior or a feature — including trivial one-line,
  one-file, UI-only, config, test, CLI, functions, or product/architecture
  docs-in-repo edits. Orchestrates requirements-complexity-agent triage, then
  spark (simple) or octopus (complex). Never implement product code in the
  parent without this workflow. Skip for pure Q&A, read-only review,
  commit-only, or explicit "do not change code" requests.
---

# Implement

**Default workflow for product and feature implementation.** If the user's
message implies developing or changing project/product behavior or a feature,
**read this skill first** and run the full workflow below — **before** any
`Write`, `Edit`, or `Delete` on product source files.

Orchestrate implementation through **mandatory complexity triage** before any
product code is written. Agent definitions live under `.cursor/agents/`.

| Agent                           | Definition                                        | Role                                                   |
| ------------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| `requirements-complexity-agent` | `.cursor/agents/requirements-complexity-agent.md` | Triage only — returns verdict or clarification request |
| `spark`                         | `.cursor/agents/spark.md`                         | Simple, local implementation (product code only)       |
| `octopus`                       | `.cursor/agents/octopus.md`                       | Complex, multi-component implementation (product only) |
| `unituna`             | `.cursor/agents/unituna.md`             | Post-executor unit tests when classified               |
| `e2eagle`              | `.cursor/agents/e2eagle.md`              | Post-executor E2E tests when classified                |

## Mandatory gate (run before touching product source)

On **every** user turn, decide:

```
Does this request develop or change project/product behavior or a feature?
├── YES → Read this skill → run Steps 1–8 (no parent Write/Edit/Delete until executor runs)
└── NO  → Skip this skill (see "Skip only when" below)
```

Treat as **YES** even when the user:

- describes the change indirectly ("make it nicer", "this is broken", "can you handle X?")
- asks in any language (Ukrainian, English, etc.)
- says the change is small, quick, trivial, or "just one line / one file / one button"
- continues a prior task that still needs product code changes
- asks to revert, undo, or roll back prior product edits (that is still a feature change)

**Never** bypass this skill because the task "looks simple" or "only UI" — triage
exists precisely for that case.

## When to use (always)

Use this skill when the user wants **any** of the following in product source
or feature-related areas (`client/`, `functions/`, `cli/`, `shared/`, `wiki/`,
`e2e/`, root config that affects the product, product/architecture docs):

| Category                     | Examples (non-exhaustive)                                                         |
| ---------------------------- | --------------------------------------------------------------------------------- |
| **Create / add**             | new component, page, hook, API, schema, CLI command, test file                    |
| **Change / update**          | edit behavior, copy, layout, styling, props, config, env templates, types         |
| **Fix**                      | bug, regression, failing test, lint/type error the user wants resolved in code    |
| **Remove / delete**          | dead code, feature, file, dependency usage                                        |
| **Refactor / rename / move** | restructure module, extract helper, rename symbol or path                         |
| **Wire / integrate**         | connect UI to API, add route, hook up Firebase, import new package usage          |
| **Improve / polish**         | "make a nice button", "clean this up", "optimize", "simplify" — if it edits files |

If you are **unsure** whether the user wants a product/feature change, **assume
YES** and either run triage or ask one clarifying question — do **not** start
editing product files while unsure.

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
  Step 6 (`unituna` and/or `e2eagle`, or skip).
- **Parent owns test-type routing** — Step 6 classifies unit / e2e / both /
  none from packages, acceptance criteria, and the diff; then launches zero or
  more test writers.
- **No git commit / push** unless the user explicitly asked
- **Parent owns ADR recording** — after product work, the parent may run `update-adr` only after AskQuestion confirmation. Never run
  `update-adr` without a Yes answer. Never ask spark or octopus to write wiki ADRs.

### Skip only when (narrow exceptions)

Do **not** use this skill when:

1. The user clearly wants **no** file changes — explain, compare options, or
   read-only investigation only.
2. **Or** a dedicated read-only skill applies instead:
   - **review** — review diff / PR / uncommitted changes without fixing
   - **git-commit** — commit already-made changes only
   - **update-adr** — ADR/wiki documentation only when no product code changes
3. **Or** implement is **already mid-flight**: triage completed, executor
   (`spark` / `octopus`) is running or just finished for the **same** task, and
   the user is continuing that work — not starting a new change request.

If the user asks a question **and** wants a product fix ("why does X fail? fix
it"), that is **not** skip — run **implement**.

### Anti-patterns (never do this)

- Jumping straight to `Write`/`Edit` because the task is "just UI" or "one button"
- Using only `use-eleks-ui` (or another domain skill) instead of **implement**
  when files will change — domain skills complement implement; they do not replace it
- Skipping triage because you already know the answer will be `simple`
- Implementing in the parent agent while spark/octopus should run

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
- [ ] Step 6: Classify needed tests → launch unituna and/or e2eagle (or skip)
- [ ] Step 7: Summarize for the user
- [ ] Step 8: If ADR candidates → AskQuestion → on Yes, run update-adr in background
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

Do not add or update tests — the parent classifies and runs unituna
and/or e2eagle as needed after you finish.
```

Wait for the executor to finish. Do not implement in the parent in parallel.

### Step 5 — Handle executor outcome

#### Spark result

| Status      | Parent action             |
| ----------- | ------------------------- |
| `done`      | Proceed to Step 6         |
| `escalated` | Re-run Step 2 (re-triage) |

Prefer re-triage when the escalation changes scope materially; prefer octopus when
spark already identified a clearly complex remainder.

#### Octopus result

| Status      | Parent action             |
| ----------- | ------------------------- |
| `done`      | Proceed to Step 6         |
| `escalated` | Re-run Step 2 (re-triage) |

Never silently ignore escalation

### Step 6 — Classify and run test writers

After a successful executor `done` with product-code changes, **classify** which
tests are needed, then launch zero or more writers. Do not always run unit
tests — simple requests may need none.

#### Classification

Decide from packages touched, acceptance criteria, and the diff:

| Classification | When                                                                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **none**       | No product changes; blocked/escalated with nothing worth covering; docs/wiki/ADR-only; trivial copy/layout with no branching and no observable contract (e.g. static label, one-line wiring with no behavior) |
| **unit**       | New/changed testable logic in `client/`, `functions/`, `cli/`, or `shared/` (hooks, stores, parsers, handlers, pure utils) that unit tests can protect                                                        |
| **e2e**        | User-visible flows or UI acceptance in `client/` (list/empty states, auth gates, favorites, share links, multi-step journeys) that need browser + emulator coverage                                           |
| **both**       | Both kinds of risk are present (common for API + UI features)                                                                                                                                                 |

Record the choice for Step 7: `tests: unit | e2e | both | none — <one-line reason>`.

Skip launching any writer when classification is **none**, or when:

- executor status was `blocked`, or
- escalated / down-escalated with **no** product changes worth covering

Do not ask spark or octopus to write tests instead of this step.

#### Launch order

When both are selected, run **sequentially**: `unituna` first, then
`e2eagle`. Always `run_in_background: false`.

##### `unituna`

- `subagent_type: "unituna"`
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

##### `e2eagle`

- `subagent_type: "e2eagle"`
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
6. **ADR candidates** — list from octopus (or `<None>` / none from spark); shown
   before Step 8 AskQuestion when present
7. **Follow-ups** — manual verification, or commit if the user asked

Do not paste entire agent outputs unless the user asks for details.

### Step 8 — Record ADRs (conditional, last)

Enter when executor status is `done` and the ADR candidates list is non-empty
(primarily from octopus). Skip when candidates are empty, `<None>`, or when
blocked/escalated with no candidates.

1. **AskQuestion** with exactly two options, e.g.:
   - **Yes — write ADR(s) now**
   - **No — leave as follow-up**

   Include the candidate titles (and one-line whys) in the prompt so the user
   can decide.

2. **On No** — note ADR recording skipped in the summary; stop.

3. **On Yes** — launch exactly one background Task:
   - `subagent_type: "generalPurpose"`
   - `run_in_background: true`
   - `description: "Write ADR(s)"`

   Prompt shape:

   ```text
   Read and follow `.cursor/skills/update-adr/SKILL.md`.

   ## ADR candidates

   <paste the candidate list from octopus — title + one-line why per item>

   Write one ADR per decision. Do not invent scope beyond the payload above.
   Do not commit.
   ```

4. **After launch** — do not await the background task; rely on the end-of-turn
   completion notification. Mark Step 8 complete once the task is launched.

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

1. User: "Add a button that shows Hello World" / "зроби гарну кнопку"
2. Parent reads **implement** first — no direct edits
3. Triage → `Verdict: simple`, `Executor: spark`
4. Spark implements in `client/` using ELEKS UI patterns (no tests)
5. Parent classifies → **tests: none** (trivial wiring / no branching contract)
6. Summary: one component + App wiring; no test writers launched

### Wrong path (do not repeat)

1. User: "Make me a nice button"
2. Parent reads `use-eleks-ui` and edits `App.tsx` directly ❌
3. **Correct:** implement → triage → spark → summary

### Pure shared parser (expected path)

1. User: "Add parseShareToken helper in shared/"
2. Triage → `Verdict: simple`, `Executor: spark`
3. Spark implements parser (no tests)
4. Parent classifies → **tests: unit** → `unituna`
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
4. Parent classifies → **tests: both** → `unituna` then `e2eagle`
5. Summary: packages touched, both writer outcomes, emulator note if relevant

### Complex feature with ADR candidates (expected path)

1. User: "Refactor auth to use a new session store"
2. Triage → `Verdict: complex`, `Executor: octopus`
3. Octopus implements; returns ADR candidates, e.g.:
   - `Session store in Firestore subcollection: keeps auth state colocated with user profile`
4. Parent classifies tests → launches writers as needed
5. Step 7 summary includes ADR candidates
6. Step 8 AskQuestion: "Write ADR(s) now?" with candidate titles
7. On Yes → background `generalPurpose` task reads `update-adr/SKILL.md` and
   writes ADR(s); parent does not await

### Ambiguous request

1. User: "Make repositories better"
2. Triage → `NEEDS_CLARIFICATION` with 2–3 concrete options
3. Parent asks user → re-triage with `CLARIFICATION_ANSWERS`
4. Then route to spark or octopus per new verdict

---

## Quality checklist

Before marking implement complete:

- [ ] Mandatory gate applied — request was classified as a product/feature change before any edit
- [ ] Triage ran before any product code
- [ ] Executor matched verdict (`spark` / `octopus`)
- [ ] Executor was not asked to write or update tests
- [ ] Escalation or down-escalation handled explicitly if it occurred
- [ ] Step 6 classification recorded (`unit | e2e | both | none`) with a reason
- [ ] Selected test writers ran (or skip was justified)
- [ ] User got a concise summary with outcome, key paths, and test routing result
- [ ] ADR candidates from octopus included in Step 7 summary when present
- [ ] Step 8: AskQuestion ran when candidates non-empty; update-adr launched in
      background only on Yes (or skip justified)
- [ ] No commit unless explicitly requested
