---
name: implement-issue
description: >-
  Orchestrates the SkillStack delivery pipeline for one GitHub issue:
  issue-spec-writer → implementation-planner → tdd-test-writer →
  tdd-implementer → code-reviewer, with feedback loops between stages, human
  gates, loop budgets and a run log. Use when the user runs /implement-issue
  with an issue number, asks to take an issue (e.g. "#42") through spec, plan,
  tests, implementation and review end to end, or asks to resume such a run.
disable-model-invocation: true
---

# Implement Issue (pipeline orchestrator)

You are the orchestrator. You run in the **main chat**, not as a subagent:
the five stage agents are subagents, and only the main chat can stop and ask
the human at a gate. You launch each stage with the Task tool
(`subagent_type` = the agent name), read its final report, decide the next
step, and keep the run log. The agents do all the content work.

```
#N ─► issue-spec-writer ─► wiki/specs/<name>
          ▲ spec gaps G-n            │
          └──── implementation-planner ─► wiki/plans/<name>
                     ▲ plan gaps P-n             │
                     └──── tdd-test-writer ─► red tests + wiki/tests/<name>
                                ▲ gaps IG-n (tests / plan)      │
                                └──── tdd-implementer ─► code + wiki/implementations/<name>
                                                                │
                                          code-reviewer ◄───────┘
                                                │ verdict + findings R-n
                                                ▼
                     wiki/reviews/<name> (saved by you); findings routed to
                     spec / plan / tests / code, downstream stages re-run
```

All artifacts of one issue share one file name, `<name>` = `<n>-<slug>.md`.
Your own file is the run log, `wiki/runs/<name>`.

## Invocation

`/implement-issue <number> [key=value ...]`

| Option | Values | Default | Effect |
| ------ | ------ | ------- | ------ |
| `mode` | `guided`, `auto` | `guided` | `guided`: design gate after the plan and a final gate. `auto`: no routine gates; escalations still stop and ask. |
| `verification` | `unit`, `full` | `unit` | Passed to `tdd-test-writer` and `tdd-implementer`. `full` also runs integration and e2e suites under the emulators. |
| `commit` | `none`, `per-task` | `none` | Passed to `tdd-implementer`. |
| `from` | `spec`, `plan`, `tests`, `implement`, `review` | detected | Force the stage to start from when resuming. |
| `review-model` | a model slug | `inherit` | Run `code-reviewer` on a different model for a more independent review. |

If no issue number is given, ask for it.

## Orchestrator rules

- **Delegate all content work.** Never write or edit a spec, plan, test,
  production file or implementation report, not even a one-line fix. Route
  the problem to the agent that owns the artifact. You write only the run log,
  the saved review, and, after approval at the final gate, commits and the PR.
- **One stage at a time, in the foreground** (`run_in_background: false`).
  Every stage edits the same working tree and needs the previous output.
- **A fresh subagent for every run; never `resume`.** The artifacts on disk
  are the handoff, and every agent revises them in place, so a fresh run
  sees the latest state without carrying stale context.
- **Self-contained prompts.** Subagents do not see this chat. Build every
  prompt from the templates in [reference.md](reference.md).
- **Parse the report header** (`Status:`, `Next:`, gap counts). If it is
  missing or malformed, read the `Status` field of the artifact the agent
  owns; if that is still unclear, treat the stage as `failed`.
- **Revisions are the versions.** Every artifact has a `Revision` field, and
  downstream artifacts record the upstream revision they were built from
  (`Spec version: r3`). Compare those numbers, not dates.
- **Re-run downstream after every upstream change.** When a spec, plan or
  manifest gets a new revision, every later stage must run again, even if it
  succeeded before.
- **Keep your context lean.** Read artifact headers and the sections a
  decision needs (open questions, gaps, task titles, findings), not whole
  files.
- **Report progress.** After every stage, append a row to the run log and tell
  the user in one sentence which stage ran, its status, and what runs next.
- Never push, open a PR, deploy, use `--no-verify`, or stash, reset or discard
  changes unless the human approves it at the final gate.

## Workflow

```
- [ ] 0. Preflight
- [ ] 1. Spec
- [ ] 2. Plan (spec ↔ plan loop)
- [ ] 3. Design gate
- [ ] 4. Tests (tests → plan loop)
- [ ] 5. Implementation (implementation → tests / plan loop)
- [ ] 6. Review (review fix loop)
- [ ] 7. Finish
```

### 0. Preflight

1. `gh auth status`, then
   `gh issue view <n> --json number,title,state,labels,url`. Stop if either
   fails. If the issue is closed, say so; in `guided` mode ask whether to
   continue.
2. Check that `.cursor/agents/` contains `issue-spec-writer.md`,
   `implementation-planner.md`, `tdd-test-writer.md`, `tdd-implementer.md`
   and `code-reviewer.md`. Stop if any is missing.
3. **Name.** If `wiki/specs/<n>-*.md` exists, reuse its file name. Otherwise
   `<name>` = `<n>-<slug>.md`, where `<slug>` is the issue title in lowercase,
   every run of characters outside `a-z0-9` replaced by `-`, trimmed of `-`,
   cut to 50 characters, with no trailing `-`.
4. **Working tree.** Run `git status --porcelain`. The run owns this issue's
   `wiki/` artifacts and, when resuming, the files listed in its manifest
   (**Test files**) and report (**Changed files**). If anything else is
   dirty, stop and ask the user to commit or stash it themselves.
5. **Resume.** If any artifact of this issue exists, see **Resume** below.
6. **Branch.**
   - If the current branch name contains `/<n>-`, stay on it.
   - Otherwise follow `contributing.md`: type `hotfix` and base `origin/main`
     when the issue has the `hotfix` label, else type `feature` and base
     `origin/develop`. Run `git fetch origin`.
   - The base must already contain the pipeline:
     `git cat-file -e <base>:.cursor/skills/implement-issue/SKILL.md`. If it
     does not, a branch from it would lose the agents in the middle of the
     run. In `guided` mode ask: branch from the current HEAD, stay on the
     current branch, or stop. In `auto` mode branch from the current HEAD and
     note it in the run log.
   - `git switch -c <type>/<name without .md> <base>`, or `git switch` to it
     if it exists.
7. **Base.** Record `git rev-parse HEAD` as `Base`. The reviewer diffs against
   it, so only this run's changes are reviewed. On resume, reuse the `Base`
   from the run log.
8. Create the run log from the template in [reference.md](reference.md).

### Resume

Start from the first stage whose output is missing or unusable:

| Stage | Run it when |
| ----- | ----------- |
| Spec | no spec |
| Plan | no plan; plan `Status: Blocked`; plan `Spec version` ≠ spec `Revision` |
| Tests | no manifest; manifest `Status: Needs plan update`; its `Plan version` or `Spec version` is stale |
| Implement | no report; report `Status` is not `Green`; any of its version fields is stale |
| Review | everything above is current |

In `guided` mode, confirm with AskQuestion: resume from the detected stage,
restart from the spec, or stop. `from=` overrides the detection. A restart
deletes nothing; the agents revise the artifacts in place.

### 1. Spec

Run `issue-spec-writer` (prompt **S1**).

- `success` → step 2.
- `failed` → stop and tell the user the reason from `Notes`.

### 2. Plan

Run `implementation-planner` (prompt **P1**).

- `success` → step 3.
- `needs-spec-update` → spec ↔ plan loop: run `issue-spec-writer` with the
  planner's gaps (**S2**), then the planner again (**P1**). Repeat while the
  set of open blocking gap IDs shrinks, at most 2 spec revisions. Then go to
  step 3 with the remaining gaps: they need a product decision from a human.
- `failed` → stop.

### 3. Design gate

Run it in `guided` mode, and in any mode while blocking gaps are open. This is
the cheapest point to correct the direction, so show the human what the
pipeline is about to build (summary template in [reference.md](reference.md)).

Ask with AskQuestion:

- **Approve and continue**: offer only when no blocking gap is open.
- **Answer open questions or gaps**: the human types answers through "Other".
- **Accept the planner's suggested resolutions** for all open gaps.
- **Request changes**: the human describes them through "Other".
- **Stop**.

Route the answer:

- Product decisions (answers to `Q-n` or `G-n`, changed requirements) →
  `issue-spec-writer` with the decisions (**S3**) → planner (**P1**).
- Technical direction ("do not touch the CLI", "reuse X") → planner directly
  (**P2**).
- Record each decision verbatim under **Decisions** in the run log.

Show the gate again if blocking gaps remain, or if the human requested changes
in `guided` mode. Never tell a downstream agent to "proceed despite Blocked";
unblock through the artifacts.

### 4. Tests

Run `tdd-test-writer` (prompt **T1**).

- `success` → step 5.
- `needs-plan-update` → planner with the plan gaps (**P3**). If the planner
  returns `needs-spec-update`, run the spec ↔ plan loop and then the design
  gate, because blocking spec gaps need a human. Then run the test writer
  again (**T1**).
- `failed` with a stale plan in `Notes` → planner (**P1**), then the test
  writer. Any other failure → escalate.

### 5. Implementation

Run `tdd-implementer` (prompt **I1**).

- `success` → step 6.
- `needs-test-update` → test writer with the gaps (**T2**) → implementer
  (**I1**).
- `needs-plan-update` → planner with the gaps (**P3**) → test writer
  (**T1**) → implementer (**I1**).
- `partial` → step 6 anyway. The reviewer diagnoses the failed tasks
  independently and routes them.
- `failed` with a stale artifact in `Notes` → re-run that stage and every
  stage after it. Any other failure → escalate.

### 6. Review

Run `code-reviewer` (prompt **R1**, or **R2** for a re-review). Save its full
final message verbatim to `wiki/reviews/<name>`, overwriting the previous
round; the reviewer carries fixed findings in its **Resolved** section.

- `approve` → step 7.
- `request-changes` → read the target in `Next`. It is the earliest stage
  with open blocker or major findings, in the order spec → plan → tests →
  code.
  - In `guided` mode, a `spec` or `plan` target changes the design the human
    approved: show those findings and ask before routing.
  - Run the target agent with the findings (**S4**, **P4**, **T3** or
    **I2**), then every later stage in order, then the reviewer again
    (**R2**).
- `failed` → stop.

### Loop budgets and escalation

| Loop | Max |
| ---- | --- |
| Spec revisions per spec ↔ plan loop | 2 |
| Tests → plan rounds | 2 |
| Implementation → tests / plan rounds | 2 |
| Review fix rounds (3 reviews in total) | 2 |
| Stage runs in the whole run | 20 |

Escalate when a budget is used up, when a round makes no progress (the same
blocking gap or finding IDs are still open after a fix round), or when a stage
fails for a reason no other agent can fix. Escalate in both modes: summarize
what is stuck (IDs, the agents' `Notes`, artifact paths) and ask with
AskQuestion: give a decision, allow one more round, or stop here. On stop, set
the run log `Status` to `stopped`, leave every file in place, and go to step
7 without the commit question.

### 7. Finish

1. Fill **Outcome** in the run log and set its `Status`.
2. Give the user the final summary (template in [reference.md](reference.md)).
   Lead with the verdict.
3. Ask with AskQuestion, in both modes:
   - **Commit** (only when there are uncommitted changes);
   - **Commit, push and open a PR**;
   - **Leave as is**.
4. **Commit.**
   - If `commit=none`, commit the production and test files first. Use type
     `fix` for a bug spec and `feat` otherwise, with a lowercase subject from
     the issue title and a header of at most 50 characters. Put `Closes #<n>`
     in the body, wrapped at 72 characters.
   - Then commit the remaining `wiki/` artifacts of this issue as
     `docs: add pipeline artifacts for #<n>`.
   - Stage explicit paths only (the report's **Changed files**, the
     manifest's **Test files**, the `wiki/` artifacts); never `git add -A`.
   - Never `--no-verify`. If a hook fails, report the output and stop.
5. **PR.** `git push -u origin <branch>`. Write the body from the PR template
   in [reference.md](reference.md) to `.git/PR_BODY.md`, run
   `gh pr create --base <develop|main> --title '<commit header>' --body-file .git/PR_BODY.md`,
   delete the file, and give the user the PR link.

## Additional resources

- Prompt templates, report routing, run log, gate, summary and PR templates:
  [reference.md](reference.md)
