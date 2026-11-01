# implement-issue reference

## Prompt template

One template for every stage. Fill `<…>` and drop the lines that do not apply.

```
Issue: #<n>
Issue folder: wiki/issues/<n>-<slug>/
Verification: <unit|full>
Commit: <none|per-task>
Base: <sha from run.md>
Feedback:
- <IDs> (<file>)
- Human decision: <Q-n or PG-n>: <answer, verbatim>
- Human decision: accept the suggested resolution of <PG-n>: <resolution text>
- Human direction: <text, verbatim>
Re-run because: <artifact> is now r<N>: <reason, with IDs>.
```

| Line             | Sent to                                                                    |
| ---------------- | -------------------------------------------------------------------------- |
| `Verification`   | test-writer, implementor                                                   |
| `Commit`         | implementor                                                                |
| `Base`           | reviewer                                                                   |
| `Feedback`       | the stage that must act on it, e.g. `TG-1, TG-3 (tests.md)`, `R-2 (review.md)` |
| `Re-run because` | any stage that runs again after an upstream revision changed               |

## Run log template

Path: `<issue folder>/run.md`. Update it after every stage.

```markdown
# Run: #<n> <issue title>

| Field   | Value                                       |
| ------- | ------------------------------------------- |
| Issue   | [#<n>](<issue url>)                         |
| Branch  | `<type>/<n>-<slug>`                         |
| Base    | `<sha>`                                     |
| Options | mode=guided, verification=unit, commit=none |
| Started | YYYY-MM-DD HH:MM                            |
| Status  | running / approved / stopped                |

## Timeline
| # | Agent | Feedback in | Result | Next |
| - | ----- | ----------- | ------ | ---- |
| 1 | spec-writer | — | success, r1, 3 open questions | plan-writer |
| 2 | plan-writer | — | needs-spec-update, r1, PG-1 blocking | design gate |

## Decisions
- YYYY-MM-DD, design gate: Q-2 → <answer, verbatim>.

## Outcome
Verdict, open findings, unverified items, rollout steps that need a human,
commits, PR link.
```

## Design gate summary

```
Design ready for #<n> <title>

Spec r<N>: <x> FR, <y> NFR, <z> BR, <w> AC
Plan r<N>: <Ready|Blocked>, packages <list>
Tasks: T-1 <title>; T-2 <title>; ...

Open questions and gaps:
- PG-1 (blocking, FR-2): <problem>. Suggested: <resolution>
- Q-3 → A-2 (assumed): <assumption>

Risks: <one line each>
```

## Final summary

Lead with one sentence: the verdict and what now works. Then:

- the branch, the base and the issue folder;
- tasks done, tests green, suites not run and why;
- open findings by severity, with IDs;
- items not verified or not automated;
- rollout steps from `plan.md` that need a human;
- the loops that ran (for example, "the plan was revised once for TG-2").

## PR body template

Mirrors `.github/PULL_REQUEST_TEMPLATE.md`. Tick the type that matches the
spec's `Type`.

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

<2–5 sentences from the Summary of implementation.md.>

Pipeline artifacts: `wiki/issues/<n>-<slug>/`

---

## How to test

<Numbered steps derived from the spec's acceptance criteria, plus the commands
that run the test files listed in tests.md.>
```
