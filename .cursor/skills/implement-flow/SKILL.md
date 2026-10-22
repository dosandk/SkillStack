---
name: implement-flow
description: >-
  Mandatory gate for product and feature implementation. Read and follow this
  skill before Write/Edit/Delete on product source whenever the user wants to
  develop, change, add, fix, update, remove, refactor, configure, style, wire,
  or improve project behavior or a feature — including trivial one-line,
  one-file, UI-only, config, CLI, functions, or product/architecture
  docs-in-repo edits. Orchestrates requirements-complexity-agent triage, then
  spark (simple) or octopus (complex). Never implement product code in the
  parent without this workflow. Skip for pure Q&A, read-only review,
  commit-only, or explicit "do not change code" requests.
---

# Implement flow

Gate for every change to product source. Read this file on each request that
develops or changes project behaviour. Read [reference.md](reference.md) when you
actually run the steps — it holds the step bodies, prompt templates, and examples.

## Tool map

The text below uses host-neutral names. Replace them with the host's tools:

| Name in this skill | Cursor           | Notes                                     |
| ------------------ | ---------------- | ----------------------------------------- |
| `ask-user`         | `AskQuestion`    | 2–4 options per question, max 3 questions |
| `general subagent` | `generalPurpose` |                                           |
| `todo list`        | `TodoWrite`      | tracks the progress checklist             |
| `config root`      | `.cursor/`       |                                           |

## Agents

Definitions live under `<config root>/agents/`.

| Agent                           | Role                                                |
| ------------------------------- | --------------------------------------------------- |
| `requirements-complexity-agent` | Triage: verdict with test routing, or clarification |
| `spark`                         | Executor for `simple`                               |
| `octopus`                       | Executor for `complex`                              |
| `unituna`                       | Unit-test writer (Step 5)                           |
| `e2eagle`                       | Playwright E2E writer (Step 5)                      |

## Gate

Applies when the request develops or changes product behaviour in `client/`,
`functions/`, `cli/`, `shared/`, `wiki/`, or root config that affects the
product. Treat as **yes** even when the user:

- describes the change indirectly ("make it nicer", "this is broken");
- asks in any language;
- calls it small, trivial, "one line", "one button";
- continues a prior task that still needs product code;
- asks to revert or roll back earlier product edits.

**Skip** only when the user clearly wants no file changes, when `review-flow`,
`git-commit`, or `update-adr` fits instead, when the request is only about tests
(a dedicated test skill applies), when implement is already mid-flight
for the same task, or when only agent config under the config root changes (edit those
files directly). A question that ends in "fix it" is not a skip. If unsure, ask
one clarifying question before editing anything.

## Hard rules

Each rule is an invariant. The named step in reference.md holds the mechanics.

1. **Verdict before code** (Step 2). No parent `Write` / `Edit` / `Delete` on
   product source until a verdict exists, from the triage subagent or the inline
   fast path. The executor writes the code, never the parent.
2. **One executor per verdict** (Step 3). Never two at once, never without a
   verdict. A relaunch after escalation reuses the same verdict.
3. **Executors never write tests or ADRs** (Steps 4–6). Tests are written only
   as part of a feature implementation, by the writers, after an explicit Yes,
   one subagent at a time.
4. **Clarification cap is 3** (Step 2c). The third `NEEDS_CLARIFICATION` ends the
   flow as blocked. The count persists across re-triage within the same task.
5. **Escalation is never silent** (Step 3). The user decides relaunch or stop.
6. **No commit or push** unless the user explicitly asked, and never before
   Step 7.

## Progress checklist

Copy into the `todo list` and track:

```
Implement progress:
- [ ] Step 1: Capture task brief
- [ ] Step 2: Triage (subagent, or inline fast path)
- [ ] Step 3: Launch executor and handle outcome
- [ ] Step 4: Confirm tests + ADRs (one ask-user, or none)
- [ ] Step 5: Test writers (on Yes)
- [ ] Step 6: ADR task (on Yes)
- [ ] Step 7: Summary
```
