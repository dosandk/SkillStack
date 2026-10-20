# Implement flow — step reference

Companion to [SKILL.md](SKILL.md). Tool names follow the tool map there.

## Step 1 — Capture task brief

From the user's request assemble:

- **Goal** — what should exist when done
- **Acceptance criteria** — observable behaviours; infer obvious defaults, do not
  invent scope
- **Packages** — `client/`, `functions/`, `cli/`, `shared/`, `wiki/`
- **Links** — story / FR / issue ids when given
- **Constraints** — anything the user ruled in or out

Keep it short; triage scores what is stated plus repo evidence.

## Step 2 — Triage

### 2a — Inline fast path (skip the subagent)

Skip the triage subagent **only** when every condition holds:

1. The user names the exact file to change.
2. The change stays in that one file, in one package.
3. No exported signature, schema, Firestore shape, or API contract changes.
4. No new dependency.

The fast path always routes to `spark`; there is nothing to decide. If you think
`octopus` is needed, one of the conditions does not hold — run 2b instead.

Then record the verdict yourself and go to Step 3:

```markdown
**Task:** <one-line restatement>
**Packages in scope:** <package>
**Verdict:** simple (inline)
**Executor:** spark
**Tests:** <unit | e2e | both | none> — <one-line reason>
```

If any condition fails, or you are unsure, run 2b.

### 2b — Triage subagent

Launch exactly one `requirements-complexity-agent`:

- `subagent_type: "requirements-complexity-agent"`
- `description: "Complexity triage"`

```text
Full Repository Path: <absolute workspace path>

## Task brief

<Step 1 brief>

## CLARIFICATION_ANSWERS

<only when resuming — paste Q→A pairs>
```

Do not start coding while triage runs. If the subagent fails on prompt shape or
missing path, fix and retry once; then stop and report.

### 2c — Parse the result

Triage returns exactly one block:

| Block                 | Parent action                                                                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEEDS_CLARIFICATION` | Count it. On the 3rd → Step 7 as blocked. Otherwise `ask-user` with its questions (2–4 options each, max 3). If the user declines → Step 7 without implementing. Else re-run 2b with answers |
| Verdict               | Capture the whole block: `Verdict`, `Executor`, `Tests`, packages, scope sketch                                                                                                              |
| Neither               | Re-run 2b once with "Return exactly one Complexity verdict or NEEDS_CLARIFICATION block". If still malformed → Step 7 as blocked                                                             |

Re-run triage also when the user materially changes requirements mid-task.

## Step 3 — Executor

Launch exactly one subagent:

| Verdict   | `subagent_type` | `description`       |
| --------- | --------------- | ------------------- |
| `simple`  | `spark`         | `Spark implement`   |
| `complex` | `octopus`       | `Octopus implement` |

```text
Full Repository Path: <absolute workspace path>

## Original user request

<verbatim or faithful summary>

## Complexity verdict

<full verdict block from Step 2>

Do not add or update tests — the parent decides on tests and ADRs after you finish.
```

Wait for it. Do not implement in the parent in parallel.

### Outcome

Read `status` from the executor JSON.

| `status`      | Parent action                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| `done`        | Step 4                                                                                                          |
| `escalated`   | `ask-user` with 2–4 options built from `blockers` (`blocker`, `neededFromParent`). Relaunch only on that choice |
| anything else | Treat as `escalated` without `blockers`: `ask-user` to relaunch or stop                                         |

## Step 4 — Confirm tests and ADRs

Run only after `done`.

1. **Confirm test routing.** Start from the verdict's `Tests:` line and check it
   against the actual diff. Override when the diff disagrees (for example logic was
   extracted into a hook, or the change turned out to be copy-only) and record why.

   | Routing | When                                                                                            |
   | ------- | ----------------------------------------------------------------------------------------------- |
   | `none`  | Copy / layout with no branching and no observable contract; docs-only                           |
   | `unit`  | Testable logic in `client/`, `functions/`, `cli/`, `shared/` (hooks, stores, parsers, handlers) |
   | `e2e`   | User-visible flows in `client/` that need browser + emulator coverage                           |
   | `both`  | Both kinds of risk (typical for API + UI features)                                              |

2. **Collect ADR candidates** from octopus `adrCandidates` (spark has none).

3. **Ask once, or not at all.**
   - `none` and no candidates → skip to Step 7.
   - Otherwise one `ask-user` with up to two questions:
     - **Tests** (only when routing ≠ `none`): "Write `<routing>` tests now?" —
       options **Yes — write tests** / **No — skip**. Include the one-line reason.
     - **ADRs** (only when candidates exist): "Record ADR(s) now?" — options
       **Yes — write ADR(s)** / **No — leave as follow-up**. List each candidate as
       `title — why`.

Record both answers for Step 7. Never launch `unituna`, `e2eagle`, or the ADR
task without the matching Yes.

## Step 5 — Test writers

Run sequentially and wait for each: `unituna` first, then `e2eagle`. Skip either
that was not selected.

**`unituna`** — `subagent_type: "unituna"`, `description: "Write unit tests"`:

```text
Full Repository Path: <absolute workspace path>

## Context

Product implementation just finished via <spark | octopus>. Analyze the current
uncommitted diff, identify meaningful behavior that still lacks unit-test
coverage, and add only the tests necessary to protect that behavior.

Follow your agent instructions (git diff scope, existing patterns, validation
commands). Do not commit.
```

**`e2eagle`** — `subagent_type: "e2eagle"`, `description: "Write e2e tests"`:

```text
Full Repository Path: <absolute workspace path>

## Context

Product implementation just finished via <spark | octopus>. Analyze the current
uncommitted diff, identify meaningful user-visible journeys that still lack E2E
coverage, and add only the Playwright tests necessary to protect those journeys.

Follow your agent instructions (git diff scope, discover Playwright patterns
in-repo, validation commands — npm run test:e2e). Do not commit.
```

## Step 6 — ADR task

Only after Step 5 is finished or skipped, and only on the ADR Yes. Launch one
`general subagent`, `description: "Write ADR(s)"`:

```text
Read and follow `<config root>/skills/update-adr/SKILL.md`.

## ADR candidates

<each octopus adrCandidates item as title — why>

Write one ADR per decision. Do not invent scope beyond the payload above.
Do not commit.
```

Wait for it to finish and note the files it created.

## Step 7 — Summary

Text in double braces is a field of the executor JSON — copy its value. Other
text is an instruction for that line. Omit the ADR line for spark.

```text
Triage: <verdict> via <subagent | inline fast path>

Status: {{status}}

Outcome: {{changes}}

Files touched: {{filesTouched}}

Tests: <routing> — <reason>; <written by unituna/e2eagle | skipped — user declined | none needed>

Checks: {{checks}}

ADRs: <files written | skipped — user declined | no candidates>

Follow-ups: what still needs a person — manual verification, or a commit when the user asked for one
```

Do not paste the executor JSON unless the user asks. When the flow stopped early
(clarification cap, user declined, escalation), say so on the `Status` line.

## Examples

### Simple label fix, named file (fast path)

1. User: "In `client/src/components/RepositoryList/RepositoryList.tsx` change the
   empty-state text to 'No repositories yet'"
2. All four fast-path conditions hold → inline verdict `simple (inline)`, `Tests: none`
3. `spark` implements
4. `none` + no candidates → no `ask-user`
5. Summary

### New API + client feature with ADR candidates

1. User: "Add install tracking endpoint and show count in the UI"
2. Triage → `complex`, `octopus`, `Tests: both`
3. Octopus implements, returns one ADR candidate
4. Parent confirms `both` against the diff → one `ask-user` with two questions
5. On Yes/Yes: `unituna`, then `e2eagle`, then the ADR task
6. Summary lists both writers' outcomes and the ADR file

### Ambiguous request

1. User: "Make repositories better"
2. Triage → `NEEDS_CLARIFICATION` (1 of 3) → `ask-user` → re-run with answers
3. Verdict on the 2nd run → executor → Step 4 → summary. On a 3rd
   `NEEDS_CLARIFICATION` → summary as blocked, no executor
