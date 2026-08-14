---
name: create-unit-tests
description: >-
  Launch unituna to write or update unit tests for behavior affected by
  current changes. Use when the user asks to add unit tests, improve coverage,
  or test recent code changes.
---

# Create Unit Tests

Do **not** write unit tests in the parent agent. Delegate to `unituna`.

## Workflow

1. Gather context from the user's request and the current workspace state.
2. Launch the `unituna` agent via Task:
   - `subagent_type: "unituna"`
   - `run_in_background: false`
   - `description: "Write unit tests"`
3. Pass a prompt shaped like:

```text
Full Repository Path: <absolute workspace path>

## Context

<user request and any relevant notes about what changed or what to cover>

Analyze the current diff, identify meaningful behavior that lacks unit-test
coverage, and add only the tests necessary to protect that behavior.

Follow your agent instructions. Do not commit.
```

4. When the agent returns, summarize briefly for the user:
   - status (done / escalated / blocked)
   - test files added or updated
   - validation result
   - any blockers or decisions needed
