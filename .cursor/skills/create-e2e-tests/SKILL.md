---
name: create-e2e-tests
description: >-
  Launch e2eagle to write or update Playwright E2E tests for user-visible
  flows affected by current changes. Use when the user asks to add E2E tests
  or cover journeys in the browser.
---

# Create E2E Tests

Do **not** write E2E tests in the parent agent. Delegate to `e2eagle`.

## Workflow

1. Gather context from the user's request and the current workspace state.
2. Launch the `e2eagle` agent via Task:
   - `subagent_type: "e2eagle"`
   - `run_in_background: false`
   - `description: "Write e2e tests"`
3. Pass a prompt shaped like:

```text
Full Repository Path: <absolute workspace path>

## Context

<user request and any relevant notes about journeys or flows to cover>

Analyze the current diff, identify meaningful user-visible journeys that lack
E2E coverage, and add only the Playwright tests necessary to protect those
journeys.

Follow your agent instructions. Do not commit.
```

4. When the agent returns, summarize briefly for the user:
   - status (done / escalated / blocked)
   - test files added or updated
   - validation result
   - any blockers or decisions needed
