---
id: story-validate-skill
title: Validate a Repository/Skill
status: planned
domain: frontend, backend
created: 2026-07-19
updated: 2026-07-30
---

# Story: Validate a Repository/Skill

## User story

As a logged-in user, I want to see validation results for my skills, so that I know whether
they pass security/convention checks and what to fix if they don't.

## Workflow

Once a day, the backend automatically validates all repositories with status `"pending"`. For each repo, it first changes the status from `"pending"` to `"in progress"` ([AD-15](../architecture-invariants.md#ad-15)), then for each
skill, fetches the content at the stored commit hash from GitHub (never a cache), runs it through the Anthropic SDK to
check for critical issues (security, convention violations) and non-critical
recommendations (best practices), and stores the results as `valid: boolean` and a structured findings list
on the skill document. The repository's overall calculated status becomes `"validated"`
only if all of its skills have `valid: true`; if any skill fails, the repo status becomes `"failed"`. 

The UI displays validation results on the owner's repo/skill view: overall status (including `"in progress"` state while validation is actively running)
plus critical issues and recommendations as two clearly separate
sections, never blended into one blob of text.

## Tasks

| Task   | Module   | Status | Description                                      |
| ------ | -------- | ------ | ---------------------------------------------------- |
| SS-401 | backend  | ready  | Validation service (writes `valid: boolean` + findings, manages status transitions) |
| SS-402 | backend  | ready  | Scheduled validation trigger (query "pending", set "in progress") |
| SS-403 | frontend | ready  | Validation results UI (shows "in progress" state and structured findings)               |

## E2E test scenarios

### E2E-1: Golden path — view validation results for a clean skill

**Given** an owner with a skill that passed automatic validation (no security/convention issues)
**When** they view their repo/skill page
**Then** the UI shows `"validated"` status, zero critical issues, and any non-critical recommendations in
their own section.

### E2E-2: Critical negative — skill fails validation

**Given** an owner with a skill that failed automatic validation (has a security issue)
**When** they view their repo/skill page
**Then** the UI shows `"failed"` status, and the critical issue is shown clearly separated from any recommendations, so the
owner knows exactly what's blocking approval.

### E2E-3: Edge case — validation in progress

**Given** a repo currently being validated (status `"in progress"`)
**When** the owner views their repo/skill page
**Then** the UI shows an `"in progress"` indicator so they know the check is actively happening.

## Dependencies

- Depends on: story-favorites (to have pending items to validate), story-auth-profile (owner identity)
- Used by: (none — leaf story)
