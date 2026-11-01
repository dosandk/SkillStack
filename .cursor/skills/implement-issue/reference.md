# implement-issue reference

## Prompt templates

Every prompt starts with the common header, then adds the stage block. Fill
`<…>` placeholders; drop lines that do not apply. Paths are relative to the
repo root.

**Common header (all stages):**

```
You are running as a stage of the implement-issue pipeline for issue #<n>.
No human is in the loop: never ask questions, follow your instructions, and
return only your final report in the exact shape they define.
```

Add a `Caller context` block whenever an upstream artifact changed since this
agent last ran, so it knows why it is re-running:

```
Caller context:
- <artifact> changed to r<N> because <reason, with IDs>.
```

### issue-spec-writer

**S1, first run:**

```
Issue: #<n>
Output path: wiki/specs/<name>
```

**S2, planner gaps:**

```
Issue: #<n>
Output path: wiki/specs/<name>
Planner feedback: gaps <G-1, G-3> in wiki/plans/<name>, section "Spec gaps".
```

**S3, human decisions from the design gate:**

```
Issue: #<n>
Output path: wiki/specs/<name>
Caller context (decisions by the human, authoritative):
- <Q-2>: <answer, verbatim>
- <G-1>: accept the planner's suggested resolution: <resolution text>
- <new or changed requirement, verbatim>
```

**S4, review findings:**

```
Issue: #<n>
Output path: wiki/specs/<name>
Review findings (target spec): <R-1, R-4> in wiki/reviews/<name>.
```

### implementation-planner

**P1, first run or after a spec revision:**

```
Spec: wiki/specs/<name>
```

**P2, technical direction from the design gate:**

```
Spec: wiki/specs/<name>
Caller context (direction from the human, authoritative):
- <direction, verbatim>
```

**P3, downstream gaps:**

```
Spec: wiki/specs/<name>
Downstream feedback:
- plan gaps <P-1, P-3> from tdd-test-writer in wiki/tests/<name>, section "Plan gaps"
- implementation gaps <IG-2> from tdd-implementer in wiki/implementations/<name>, section "Implementation gaps"
```

**P4, review findings:**

```
Spec: wiki/specs/<name>
Review findings (target plan): <R-2> in wiki/reviews/<name>.
```

### tdd-test-writer

**T1, first run or after a plan revision:**

```
Plan: wiki/plans/<name>
Spec: wiki/specs/<name>
Scope: all
Verification: <unit|full>
```

**T2, implementer gaps:** T1 plus

```
Test gaps from tdd-implementer: <IG-1> in wiki/implementations/<name>, section "Implementation gaps".
```

**T3, review findings:** T1 plus

```
Review findings (target tests): <R-3> in wiki/reviews/<name>.
```

### tdd-implementer

**I1, first run or after a manifest revision:**

```
Manifest: wiki/tests/<name>
Scope: all
Verification: <unit|full>
Commit: <none|per-task>
```

**I2, review findings:** I1 plus

```
Review findings (target code): <R-5, R-6> in wiki/reviews/<name>.
```

### code-reviewer

Pass `model: <review-model>` to the Task tool when the option is set.

**R1, first review:**

```
Implementation report: wiki/implementations/<name>
Base: <base sha from the run log>
Verification: unit
```

**R2, re-review:** R1 plus

```
Previous review: wiki/reviews/<name>
```

## Report routing

| Agent | Status | Next action |
| ----- | ------ | ----------- |
| issue-spec-writer | `success` | planner |
| issue-spec-writer | `failed` | stop, report `Notes` |
| implementation-planner | `success` | design gate (`guided`), else tests |
| implementation-planner | `needs-spec-update` | spec ↔ plan loop, then design gate |
| implementation-planner | `failed` | stop |
| tdd-test-writer | `success` | implementer |
| tdd-test-writer | `needs-plan-update` | planner (P3), then test writer |
| tdd-test-writer | `failed` | stale plan: planner, then test writer; else escalate |
| tdd-implementer | `success` | reviewer |
| tdd-implementer | `needs-test-update` | test writer (T2), then implementer |
| tdd-implementer | `needs-plan-update` | planner (P3), test writer, implementer |
| tdd-implementer | `partial` | reviewer |
| tdd-implementer | `failed` | stale artifact: re-run from that stage; else escalate |
| code-reviewer | `approve` | finish |
| code-reviewer | `request-changes` | target from `Next`, then every later stage, then re-review |
| code-reviewer | `failed` | stop |

## Run log template

Path: `wiki/runs/<name>`. Update it after every stage.

```markdown
# Run: #<n> <issue title>

| Field        | Value                                   |
| ------------ | --------------------------------------- |
| Issue        | [#<n>](<issue url>)                     |
| Branch       | `<type>/<n>-<slug>`                     |
| Base         | `<sha>`                                 |
| Mode         | guided / auto                           |
| Verification | unit / full                             |
| Commit       | none / per-task                         |
| Review model | inherit / <slug>                        |
| Started      | YYYY-MM-DD HH:MM                        |
| Status       | running / approved / stopped            |

## Artifacts
- Spec: [<name>](../specs/<name>)
- Plan: [<name>](../plans/<name>)
- Tests: [<name>](../tests/<name>)
- Implementation: [<name>](../implementations/<name>)
- Review: [<name>](../reviews/<name>)

## Timeline
| # | Stage | Agent | Prompt | Result | Next |
| - | ----- | ----- | ------ | ------ | ---- |
| 1 | Spec | issue-spec-writer | S1 | success, r1, 3 open questions | plan |
| 2 | Plan | implementation-planner | P1 | needs-spec-update, G-1 blocking | spec (S2) |

## Decisions
- YYYY-MM-DD, design gate: Q-2 → <answer, verbatim>.

## Outcome
Final verdict, open findings, unverified items, rollout steps that need a
human, commits, PR link.
```

## Design gate summary

```
Design ready for #<n> <title>

Spec  wiki/specs/<name> (r<N>): <x> FR, <y> NFR, <z> BR, <w> AC
Plan  wiki/plans/<name> (r<N>): <Ready|Blocked>, packages <list>
Tasks T-1 <title>; T-2 <title>; ...

Open questions and gaps:
- G-1 (blocking, FR-2): <problem>. Suggested: <resolution>
- Q-3 → A-2 (assumed): <assumption>

Risks: <one line each>
```

## Final summary (chat)

Lead with one sentence: the verdict and what now works. Then:

- branch and base;
- links to the five artifacts and the run log;
- tasks done, tests green, suites not run (and why);
- open findings by severity, with IDs;
- items listed as not verified or not automated;
- rollout steps from the implementation report that need a human;
- loops that ran (for example, "the plan was revised once for P-2").

## PR body template

Mirrors `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Linked ticket

Closes #<n>

---

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Docs update

---

## What was changed

<2–5 sentences from the implementation report's Summary.>

Spec: `wiki/specs/<name>` · Plan: `wiki/plans/<name>` · Review: `wiki/reviews/<name>`

---

## How to test

<Numbered steps derived from the spec's acceptance criteria, plus the test
commands from the manifest.>
```

Tick the type that matches the spec's `Type`.
