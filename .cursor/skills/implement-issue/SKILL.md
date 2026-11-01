---
name: implement-issue
description: >-
  Orchestrates the SkillStack delivery pipeline for one GitHub issue:
  spec-writer → plan-writer → test-writer → implementor → reviewer, with
  feedback loops, human gates, loop budgets and a run log. Use when the user
  runs /implement-issue with an issue number, asks to take an issue (e.g.
  "#42") through spec, plan, tests, implementation and review end to end, or
  asks to resume such a run.
disable-model-invocation: true
---

# Implement Issue (pipeline orchestrator)

You are the orchestrator, and you run in the main chat: only the main chat can
ask the human. You launch each stage agent with the Task tool
(`subagent_type` = the agent name), read its report, route the next step, and
keep the run log. First read `.cursor/skills/pipeline-protocol/SKILL.md`: it
defines the issue folder, the artifact header, IDs, gaps, feedback, commits and
the stage report you parse.

```
issue #n
  │
  ▼
spec-writer ──► spec.md ◄─────────────────── human decisions, R-n
  │
  ▼
plan-writer ──► plan.md ◄─────────────────── TG / IG gaps, R-n, human direction
  │   (blocking PG gaps ──► design gate)
  ▼
test-writer ──► red tests + tests.md ◄────── IG gaps, R-n
  │
  ▼
implementor ──► code + implementation.md ◄── R-n
  │
  ▼
reviewer ─────► review.md ── approve ──► finish
```

## Invocation

`/implement-issue <number> [key=value ...]`

| Option         | Values                                         | Default  | Effect                                                                                                    |
| -------------- | ---------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `mode`         | `guided`, `auto`                               | `guided` | `guided`: design gate after the plan, and a final gate. `auto`: only blocking gaps and escalations stop the run. |
| `verification` | `unit`, `full`                                 | `unit`   | Passed to test-writer and implementor. `full` also runs the integration and e2e suites under the emulators. |
| `commit`       | `none`, `per-task`                             | `none`   | Passed to implementor.                                                                                    |
| `from`         | `spec`, `plan`, `tests`, `implement`, `review` | detected | The stage to start from when resuming.                                                                    |

If no issue number is given, ask for it.

## Rules

- **Delegate all content work.** Never write or edit a stage artifact, a test
  or a production file, not even a one-line fix: route the problem to the
  stage that owns it. You write only `run.md`, and after approval at the final
  gate, commits and the PR.
- **One stage at a time, in the foreground** (`run_in_background: false`), in
  a **fresh subagent every time; never `resume`**. The issue folder is the
  handoff.
- **Prompts** follow the template in [reference.md](reference.md); subagents do
  not see this chat.
- **Parse the report.** If it is missing or malformed, read the `Status` of the
  stage's artifact; if that is still unclear, treat the stage as `failed`.
- **Re-run later stages only when an upstream `Revision` changed**: compare
  each artifact's **Built from** with the current revisions. A stage that
  leaves its revision unchanged does not trigger the stages after it.
- **Keep your context lean.** Read artifact headers and the sections a decision
  needs (open questions, gaps, task titles, findings), not whole files.
- **Report progress.** After every stage, add a row to the run log and tell the
  user in one sentence what ran, its status, and what runs next.
- Push, open a PR, stash, reset or discard changes only with approval at the
  final gate; never use `--no-verify`.

## Workflow

```
- [ ] 0. Preflight
- [ ] 1. Run the stages by the routing table
- [ ] 2. Design gate, whenever routing reaches it
- [ ] 3. Finish
```

### 0. Preflight

1. `gh auth status`, then `gh issue view <n> --json number,title,state,labels,url`;
   stop if either fails. If the issue is closed, say so; in `guided` mode ask
   whether to continue.
2. **Folder.** Reuse `wiki/issues/<n>-*/` if it exists. Otherwise use
   `wiki/issues/<n>-<slug>/`, where `<slug>` is the issue title in lowercase,
   every run of characters outside `a-z0-9` replaced by `-`, trimmed of `-`,
   and cut to 50 characters without a trailing `-`.
3. **Working tree.** Run `git status --porcelain`. The run owns the issue
   folder and, when resuming, the files in the **Test files** of `tests.md` and
   the **Changed files** of `implementation.md`. If anything else is dirty,
   stop and ask the user to commit or stash it.
4. **Resume.** If the folder already has artifacts, see **Resume**.
5. **Branch.** Stay on the current branch if its name contains `/<n>-`.
   Otherwise follow `contributing.md`: `hotfix/` from `origin/main` for an
   issue labeled `hotfix`, else `feature/` from `origin/develop`. Run
   `git fetch origin`, then `git switch -c <type>/<n>-<slug> <base>`, or
   `git switch` to the branch if it exists.
6. **Base.** Record `git rev-parse HEAD` as `Base`; on resume, reuse the one in
   `run.md`. The reviewer reviews only the changes since `Base`.
7. Create `run.md` from the template in [reference.md](reference.md).

### Resume

Start from the first stage whose artifact is missing or unusable:

| Stage     | Run it when                                                                  |
| --------- | ---------------------------------------------------------------------------- |
| Spec      | no `spec.md`                                                                 |
| Plan      | no `plan.md`; `Status: Blocked`; built from an older spec revision           |
| Tests     | no `tests.md`; `Status: Needs plan update`; built from older revisions       |
| Implement | no `implementation.md`; `Status` is not `Green`; built from older revisions  |
| Review    | everything above is current                                                  |

In `guided` mode, confirm with AskQuestion: resume from the detected stage,
restart from the spec, or stop. `from=` overrides the detection. A restart
deletes nothing; the agents revise their artifacts in place.

### 1. Routing

| Stage       | Status                | Next                                                                                              |
| ----------- | --------------------- | ------------------------------------------------------------------------------------------------- |
| spec-writer | `success`             | plan-writer                                                                                       |
| plan-writer | `success`             | test-writer; in `guided` mode, the design gate first after the plan's first run and after requested changes |
| plan-writer | `needs-spec-update`   | design gate                                                                                       |
| test-writer | `success`             | implementor                                                                                       |
| test-writer | `needs-plan-update`   | plan-writer with the TG gaps (on `needs-spec-update`, design gate), then test-writer              |
| implementor | `success`, `partial`  | reviewer; it diagnoses failed tasks itself                                                        |
| implementor | `needs-test-update`   | test-writer with the IG gaps, then implementor                                                    |
| implementor | `needs-plan-update`   | plan-writer with the IG gaps, then test-writer, then implementor                                  |
| reviewer    | `approve`             | finish                                                                                            |
| reviewer    | `request-changes`     | the `Target` stage (`spec` → spec-writer, `plan` → plan-writer, `tests` → test-writer, `code` → implementor) with the `Open` findings, then the later stages whose inputs changed, then reviewer |
| any         | `failed`              | escalate                                                                                          |

In `guided` mode, a review target of `spec` or `plan` changes the design the
human approved: show those findings and ask before routing them.

### 2. Design gate

Run it in `guided` mode after the first plan, and in any mode while blocking
`PG` gaps are open. It is the cheapest point to correct the direction: show the
summary (template in [reference.md](reference.md)), then ask with AskQuestion:

- **Approve and continue**: offer only when no blocking gap is open;
- **Answer open questions or gaps**: the human types the answers through
  "Other";
- **Accept the plan-writer's suggested resolutions** for all open gaps;
- **Request changes**: the human describes them through "Other";
- **Stop**.

Route the answer:

- product decisions (answers to `Q` or `PG`, changed requirements) →
  spec-writer with the decisions, then plan-writer;
- technical direction ("do not touch the CLI", "reuse X") → plan-writer.

Record every decision verbatim under **Decisions** in `run.md`. After the
routed stages finish, show the gate again while blocking gaps remain, or in
`guided` mode after the human requested changes; otherwise continue with
test-writer. Never tell a stage to proceed despite `Blocked`; unblock through
the artifacts.

### Loop budgets and escalation

| Loop                                           | Max |
| ---------------------------------------------- | --- |
| test-writer → plan-writer rounds               | 2   |
| implementor → test-writer / plan-writer rounds | 2   |
| Review fix rounds (3 reviews in total)         | 2   |
| Stage runs in the whole run                    | 20  |

Escalate when a budget is used up, when a round makes no progress (the same
blocking gap or finding IDs are still open after a fix round), or when a stage
fails. Escalate in both modes: summarize what is stuck (IDs, the stage's
`Notes`, file paths) and ask with AskQuestion: give a decision, allow one more
round, or stop. On stop, set the `Status` of `run.md` to `stopped`, leave every
file in place, and go to step 3 without the commit question.

### 3. Finish

1. Fill **Outcome** in `run.md` and set its `Status`.
2. Give the user the final summary (template in [reference.md](reference.md)),
   leading with the verdict.
3. Ask with AskQuestion, in both modes: **Commit** (only when there are
   uncommitted changes), **Commit, push and open a PR**, or **Leave as is**.
4. **Commit** by the protocol's **Commits** rules:
   - with `commit=none`, first the production and test files (the
     **Changed files** of `implementation.md` and the **Test files** of
     `tests.md`), typed `fix` for a bug spec and `feat` otherwise, with a
     subject from the issue title and `Closes #<n>` in the body;
   - then the issue folder, as `docs: add pipeline artifacts for #<n>`;
   - if a hook fails, report its output and stop.
5. **PR.** Run `git push -u origin <branch>`, write the body from the PR
   template in [reference.md](reference.md) to `.git/PR_BODY.md`, run
   `gh pr create --base <develop|main> --title '<commit header>' --body-file .git/PR_BODY.md`,
   delete the file, and give the user the PR link.
