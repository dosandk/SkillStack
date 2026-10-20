---
name: implement-flow
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

# Implement flow

Gate for every change to product source. Read this file on each request that
develops or changes project behaviour. Read [reference.md](reference.md) when you
actually run the steps — it holds the step bodies, prompt templates, and examples.

## Tool map

The text below uses host-neutral names. Replace them with the host's tools:

| Name in this skill | Cursor           |
| ------------------ | ---------------- |
| `ask-user`         | `AskQuestion`    |
| `general subagent` | `generalPurpose` |
| `todo list`        | `TodoWrite`      |
| `config root`      | `.cursor/`       |

## Agents

Definitions live under `<config root>/agents/`.

| Agent                           | Role                                                        |
| ------------------------------- | ----------------------------------------------------------- |
| `requirements-complexity-agent` | Triage only — verdict (with test routing) or clarification  |
| `spark`                         | Simple, local implementation (product code only)            |
| `octopus`                       | Complex, multi-component implementation (product code only) |
| `unituna`                       | Unit tests, after the executor, only on a Yes               |
| `e2eagle`                       | Playwright E2E tests, after the executor, only on a Yes     |

## Gate

Applies when the request develops or changes product behaviour in `client/`,
`functions/`, `cli/`, `shared/`, `e2e/`, `wiki/`, or root config that affects the
product. Treat as **yes** even when the user:

- describes the change indirectly ("make it nicer", "this is broken");
- asks in any language;
- calls it small, trivial, "one line", "one button";
- continues a prior task that still needs product code;
- asks to revert or roll back earlier product edits.

**Skip** only when the user clearly wants no file changes, when `review-flow`,
`git-commit`, or `update-adr` fits instead, when implement is already mid-flight
for the same task, or when only agent config under the config root changes (edit those
files directly). A question that ends in "fix it" is not a skip. If unsure, ask
one clarifying question before editing anything.

## Hard rules

1. **Triage before code.** No parent `Write` / `Edit` / `Delete` on product source
   until a verdict exists. The verdict comes from the triage subagent, or from the
   inline fast path when all four of its conditions hold (reference.md, Step 2).
   Even on the fast path the executor writes the code, not the parent.
2. **One executor, matched to the verdict.** `simple` → `spark`, `complex` →
   `octopus`. Never both, never in parallel, never without a verdict.
3. **Executors never write tests or ADRs.** Writers and the ADR task run only
   after a Yes in Step 4, one subagent at a time.
4. **Clarification cap.** `NEEDS_CLARIFICATION` may appear at most 3 times. On the
   3rd, do not ask again and do not launch an executor — summarize as blocked.
5. **Escalation is never silent.** `escalated` → `ask-user` built from `blockers`;
   any other non-`done` result is treated the same. Relaunch the executor only if
   the user picks that. Do not re-run triage.
6. **No commit or push** unless the user explicitly asked.

## Progress checklist

Copy and track:

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
