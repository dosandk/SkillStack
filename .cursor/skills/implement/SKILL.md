---
name: implement
description: >-
  Orchestrate implementation tasks via requirements-complexity-agent triage,
  then route to spark (simple) or octopus (complex). Use when the user asks to
  implement, build, add, create, fix, or refactor a feature, bugfix, API,
  UI page, CLI command, Cloud Function, or schema change — before writing any
  product code. Never skip triage, even for trivial one-file changes.
---

# Implement

Orchestrate implementation through **mandatory complexity triage** before any
product code is written. Agent definitions live under `.cursor/agents/`.

| Agent                           | Definition                                        | Role                                                   |
| ------------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| `requirements-complexity-agent` | `.cursor/agents/requirements-complexity-agent.md` | Triage only — returns verdict or clarification request |
| `spark`                         | `.cursor/agents/spark.md`                         | Simple, local implementation                           |
| `octopus`                       | `.cursor/agents/octopus.md`                       | Complex, multi-component implementation                |

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
- [ ] Step 4: Launch spark or octopus
- [ ] Step 5: Handle executor outcome (done / escalated / down-escalated)
- [ ] Step 6: Summarize for the user
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

### Step 6 — Summarize for the user

Return a short summary:

1. **Triage** — verdict (`simple` / `complex`) in one line
2. **Outcome** — done / escalated / blocked + what changed
3. **Files touched** — key paths (not a raw dump unless small)
4. **Checks** — typecheck/lint/tests run and result
5. **Follow-ups** — ADR candidate, manual verification, or commit if the user
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
3. Spark implements in `client/` using ELEKS UI patterns
4. Summary: one component + App wiring, typecheck pass

### New API + client feature (expected path)

1. User: "Add install tracking endpoint and show count in the UI"
2. Triage → `Verdict: complex`, `Executor: octopus`
3. Octopus: consistency brief → todos → functions + client + tests
4. Summary: packages touched, tests added, emulator note if relevant

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
- [ ] Escalation or down-escalation handled explicitly if it occurred
- [ ] User got a concise summary with outcome and key paths
- [ ] No commit unless explicitly requested
