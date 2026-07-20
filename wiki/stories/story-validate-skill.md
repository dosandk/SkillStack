---
id: story-validate-skill
title: Validate a Repository/Skill
status: planned
domain: frontend, backend
created: 2026-07-19
updated: 2026-07-19
---

# Story: Validate a Repository/Skill

## User story

As a logged-in user, I want to validate my uploaded skill(s), so that I know whether
they pass security/convention checks and can see what to fix if they don't.

## Workflow

From their own repo/skill view, the owner clicks "Validate." The backend re-fetches the
skill's latest content from GitHub (never a cache), runs it through the Anthropic SDK to
check for critical issues (security, convention violations) and non-critical
recommendations (best practices), and stores the results as a structured findings list
on the skill document. The repository's overall calculated status becomes `validated`
only if none of its skills have a critical finding. The same underlying check also runs
automatically once a day against anything not yet validated, so validation isn't purely
manual. The UI shows critical issues and recommendations as two clearly separate
sections, never blended into one blob of text.

## Tasks

| Task   | Module   | Status | Description                                      |
| ------ | -------- | ------ | ---------------------------------------------------- |
| SS-401 | backend  | ready  | Validation service                                    |
| SS-402 | backend  | ready  | On-demand + scheduled validation triggers             |
| SS-403 | frontend | ready  | Validate UI                                           |

## E2E test scenarios

### E2E-1: Golden path — validate a clean skill

**Given** a logged-in owner with a pending skill that has no security/convention issues
**When** they click "Validate"
**Then** the skill's status becomes `validated`
**And** the UI shows zero critical issues, plus any non-critical recommendations in
their own section.

### E2E-2: Critical negative — skill fails validation

**Given** a logged-in owner with a pending skill that has a security issue
**When** they click "Validate"
**Then** the skill's (and its repository's) status becomes `failed`
**And** the critical issue is shown clearly separated from any recommendations, so the
owner knows exactly what's blocking approval.

### E2E-3: Permission/edge boundary — validating someone else's repo

**Given** a logged-in user who is not the owner of a given repository
**When** they attempt to trigger validation for it (e.g. by calling the endpoint
directly with someone else's repo id)
**Then** the request is rejected
**And** the target repo/skill's status is unchanged.

## Dependencies

- Depends on: story-upload-repo
- Used by: (none — leaf story)
