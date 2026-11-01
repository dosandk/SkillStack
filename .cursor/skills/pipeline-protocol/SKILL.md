---
name: pipeline-protocol
description: >-
  Shared contract of the implement-issue pipeline: issue folder layout,
  artifact header, IDs, revisions, gaps, feedback, commits and the stage
  report. Read by the implement-issue orchestrator and its stage agents.
disable-model-invocation: true
---

# Pipeline protocol

The `implement-issue` orchestrator runs the stage agents one at a time, each
in a fresh subagent. Stages hand off only through files in the issue folder.
No human talks to a stage agent: never ask questions and never stop halfway;
do everything the inputs and the code allow, and record the rest as gaps.

## Issue folder

`wiki/issues/<n>-<slug>/`, passed to every stage as `Issue folder`:

| File                | Owner        | Holds                                              |
| ------------------- | ------------ | -------------------------------------------------- |
| `spec.md`           | spec-writer  | requirements: what and why                         |
| `plan.md`           | plan-writer  | design and tasks: how                              |
| `tests.md`          | test-writer  | test manifest: test cases, contracts, red baseline |
| `implementation.md` | implementor  | task status, changed files, verification           |
| `review.md`         | reviewer     | findings and verdict                               |
| `run.md`            | orchestrator | run log                                            |

Write only the file you own, plus the code files your agent definition allows;
read the others. If your file exists, revise it in place: keep what is still
valid, with its IDs, and change the rest.

## Artifact header

Every artifact starts with this table, plus the fields its template adds:

| Field      | Value                                      |
| ---------- | ------------------------------------------ |
| Issue      | [#<n>](<issue url>)                        |
| Status     | values defined by the stage, if any        |
| Revision   | <N>                                        |
| Built from | `spec r<N>, plan r<N>, ...` (not for spec) |

- `Revision` is the artifact's version. Increment it on every content change
  and never otherwise: the orchestrator re-runs later stages only when it
  changes.
- `Built from` lists the `Revision` of every upstream artifact you read.

## IDs

| Owner       | IDs                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| spec-writer | `FR` functional, `NFR` non-functional, `BR` business rule or edge case, `AC` acceptance criterion, `Q` open question |
| plan-writer | `D` decision, `A` assumption, `T` task, `PG` gap against the spec                                          |
| test-writer | `TC` test case, `C` contract the tests impose, `TG` gap against the plan                                   |
| implementor | `DV` deviation from the plan, `IG` gap against the tests or the plan                                       |
| reviewer    | `R` finding                                                                                                |

IDs are the contract between stages: cite them instead of restating content,
never renumber or reuse one, and continue after the highest existing number.
Mark a removed item `~~FR-3~~ (removed: <reason>)`.

## Gaps

When an upstream artifact keeps you from doing your job correctly, still do
everything that does not depend on it, then record a gap under `## Gaps`:

`- **PG-1** (blocking, spec, FR-2): <problem>. Suggested: <resolution>.`

- **blocking**: you cannot finish correctly until the target changes;
- **non-blocking**: you continued on a stated assumption the target should
  confirm or override;
- the target is the stage that must change: `spec`, `plan` or `tests`.

Move a gap that no longer applies to `### Resolved`, with one line: how it was
resolved and in which revision.

## Feedback

The orchestrator may pass `Feedback`: gaps raised by later stages (under
`## Gaps` of their file), review findings (under `## Findings` of
`review.md`), or human decisions and directions. Handle every item:

- right and in your scope: change your artifact, and your code if you own code;
- really an upstream problem: raise your own gap against that stage;
- already answered: leave it, and say where the answer is.

Record each item under `## Feedback` as `- **<ID>** (<source>): <resolution>.`
Human decisions and directions are authoritative.

## Writing

English, concrete, identifiers, paths and commands in backticks. Keep the
template's section order and drop optional sections that would be empty.

## Limits

Stage agents never push, open a PR, post on GitHub, deploy, run anything
against a real Firebase project (`deploy`, `db:seed`, `db:clear` outside the
emulators), pass `--no-verify`, or stash, reset or discard changes. Never
touch files that were dirty before the run and belong to no artifact of this
issue.

## Commits

For the implementor with `Commit: per-task`, and for the orchestrator at the
end of a run:

- stage explicit paths only, never `git add -A` or `git add .`;
- commitlint: type `feat`, `fix` (bug specs) or `docs`; lowercase subject
  without a trailing period; header of at most 50 characters; blank line
  before the body; body lines of at most 72 characters;
- commit tests together with the code that turns them green: the `pre-push`
  hook runs the root unit suite;
- if a hook fails, report its output; never bypass it.

## Stage report

Your final message is only this block; the orchestrator parses it:

```
Status: <stage status>
Artifact: wiki/issues/<n>-<slug>/<file> (r<N>)
Gaps: <n> blocking (<IDs>), <m> non-blocking
<stage lines>
Notes: <one or two sentences, or "none">
```

On `failed`, set `Artifact: none` and give the reason in `Notes`. Your agent
definition lists the statuses and the stage lines, and says when they replace
the `Gaps` line.
