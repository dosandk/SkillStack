---
name: update-adr
description: >-
  Add a new Architectural Decision Record to
  wiki/architectural-decision-records/ — determine the next ADR number, write
  the record from the standard template, and update the ADR index. Use when the
  user wants to record an architectural decision, add an ADR, or document why a
  design choice was made.
---

# Update ADR

Follow this workflow to add a new Architectural Decision Record (ADR) to
`wiki/architectural-decision-records/`.

## What an ADR captures

An ADR records **one** architectural decision and, above all, **why** it was
made. Companion document `wiki/architecture.md` describes the current shape of
the system; ADRs explain the reasoning behind that shape. Keep the two in sync:
if a new ADR changes the described architecture, update `architecture.md` too.

## Hard rules

- **Never invent the decision.** If the user has not told you the decision,
  its context, and its consequences, ask before writing. An ADR with guessed
  content is worse than none.
- **One decision per ADR.** If the request bundles several unrelated decisions,
  propose splitting them into separate ADRs.
- **Never renumber or rewrite existing ADRs** unless the user explicitly asks.
  Existing records are historical; superseding one is itself a new ADR (see
  Superseding below).
- **Show the drafted ADR and the index change, then wait for confirmation**
  before treating the task as done. Report the file created and the index row
  added.

<!-- TODO: add npm script for adr creation and remove template section from this file -->

## Template

Match the existing records exactly — bold run-in labels, `Accepted` status,
`Consequences` as a bullet list that includes at least one trade-off / cost.

```md
## ADR-N — <Concise decision title>

**Status:** Accepted

**Context.** <The forces at play: what problem, constraint, or tension prompted
the decision. Enough that a future reader understands the situation without
external knowledge.>

**Decision.** <What was decided, stated in the present tense as a rule the
codebase follows. Name the concrete tools, layers, or paths involved.>

**Consequences.**

- <A benefit or property this decision buys.>
- <Another consequence.>
- <At least one cost / trade-off / constraint it imposes.>
```

Status is normally `Accepted`. Use `Proposed` only if the user says the decision
is not yet ratified, and `Superseded by ADR-N` on an old record when a new one
replaces it.

## Superseding an existing decision

When a new decision replaces an old one:

- Write a new ADR (next number) that states the new decision and references the
  one it replaces in its context.
- On the old record, change the status line to `**Status:** Superseded by ADR-N`.
  Do not delete or edit the old record's context/decision — the history stays.
