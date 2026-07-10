---
name: implement-feature
description: >-
  Implements a feature from the wiki/features backlog: reads the
  feature spec, plans the tasks, verifies in the running app, 
  checks off completed tasks and updates status.
---

# Implement Feature (SkillStack)

End-to-end workflow:
feature spec (`wiki/features/NNN-*.md`) → plan → implement → verify → update backlog

## Hard rules

- **The feature spec is the contract.** Implement exactly what the task subsections in
  `wiki/features/NNN-*.md` describe — no more, no less. If a requirement is ambiguous, stop and ask.
- **Never guess scope.** Implement only the tasks the user asked for. If they name a feature without
  naming tasks, list the feature's tasks and confirm which to do before writing code.
- **Keep the backlog in sync.** When a task is done and verified, flip its checkbox `[ ] → [x]` in
  the feature file, and update the feature `Status:` and the `[new] → [in progress] → [done]` marker
  in `wiki/features/index.md`.
- If the user only asked to plan, do not create a branch or change code until they confirm.

## Prerequisites

- The feature exists in `wiki/features/` and is listed in `wiki/features/index.md`.

## Workflow

### 1. Resolve the feature

From the user's input (a number like `1` / `001`, or a name like "browse and search skills"):

- Match against `wiki/features/index.md` and the `wiki/features/NNN-*.md` filenames.
- If nothing matches or it's ambiguous, list the features from `index.md` and ask which one.

### 2. Read the spec and its context

Read, in this order:

1. `wiki/features/index.md` — common rules (aliases `[FE]`/`[BE]`, eleks-ui requirement, statuses).
2. `wiki/features/NNN-<slug>.md` — the feature: story, task checklist, and each `### Task N.M` detail.
3. `wiki/adrs/001-init-arhitecture.md` — architecture (Firebase Hosting + Functions + Auth, folder map).

Build an implementation brief from the task subsections: for each task, its alias (`[FE]`/`[BE]`),
target folder, acceptance criteria, and dependencies on other tasks.

### 3. Plan and confirm

Present a short plan **before writing code**:

- Which tasks (by number) you will implement, and their `[FE]`/`[BE]` split.
- Order: a `[FE]` task that depends on an API can proceed with **mock data** while its `[BE]`
  task is pending — the specs call for this explicitly. Otherwise do `[BE]` before the `[FE]` that
  consumes it.

Ask for confirmation if scope or requirements are unclear.

### 4. Update the backlog

For every completed, verified task:

- In `wiki/features/NNN-*.md`: flip `- [ ] Task N.M …` → `- [x] Task N.M …`.
- In `wiki/features/index.md` and the feature's `Status:` line: `new` → `in progress` (some tasks
  done) → `done` (all tasks done).

## Out of scope (v1)

- Commit changes
- Opening the PR (hand off to the `.cursor/skills/implement-issue` flow or `gh` if the user asks).
- Real GitHub OAuth setup — dev uses the Firebase Auth emulator.

## Example invocation

```text
/implement feature 1
```

Or: "implement tasks 1.1 and 1.2 from wiki/features".
