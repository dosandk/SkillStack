---
id: story-{slug}
title: [Story Title]
status: draft | planned | in-progress | done
domain: [primary domain(s), e.g. cli, backend, frontend — list all modules it touches]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# Story: [Story Title]

## User story

As a [role], I want to [capability], so that [benefit].

## Workflow

[Narrative of the full cross-module flow this story covers, start to finish — which
modules are involved and how they hand off to each other (e.g. CLI calls a Cloud
Function, which reads/writes Firestore, before the CLI continues).]

## Tasks

| Task   | Module   | Status  | Description   |
| ------ | -------- | ------- | -------------- |
| SS-### | frontend | ready   | [description]  |
| SS-### | backend  | draft   | [description]  |

A story is done when every task in this table is done. Each task's own unit/integration
test requirements live in its task file; this story instead owns the end-to-end test
requirements below.

## E2E test scenarios

### E2E-1: [Golden path]

**Given** [precondition with specific state]
**When** [specific user action with parameters]
**Then** [observable outcome with verifiable assertions]
**And** [side effect: database state, notification, audit log, etc.]

### E2E-2: [Critical negative scenario]

**Given** [precondition]
**When** [action that should fail — invalid input, expired token, missing permission]
**Then** [specific error behavior: HTTP status, error message, UI feedback]
**And** [system state remains unchanged / rollback occurs]

### E2E-3: [Permission boundary or edge-case scenario]

**Given** [user with role X attempting action restricted to role Y, or a boundary
condition such as an unreachable dependency]
**When** [the restricted action or edge case is exercised]
**Then** [access denied / correct fallback behavior with appropriate feedback]
**And** [attempt is logged or handled without corrupting state]

## Dependencies

- Depends on: [other story IDs]
- Used by: [other story IDs]
