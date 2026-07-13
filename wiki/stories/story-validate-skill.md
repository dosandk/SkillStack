---
id: story-validate-skill
title: Validate a Repository/Skill & View Results
status: planned
domain: frontend, backend
created: 2026-07-10
updated: 2026-07-10
---

# Story: Validate a Repository/Skill & View Results

## User story

As the owner of an uploaded repository or skill, I want to trigger validation and see
a clear breakdown of what passed and what didn't, so that I know whether — and why —
my content is trustworthy enough to show up in the public catalog.

## Workflow

The owner clicks Validate on their repository or an individual skill. The client calls
an on-demand validation Cloud Function, which always fetches the latest version from
GitHub, runs it through an LLM (via the Anthropic SDK) to check for security issues and
convention adherence (critical, blocking) plus best practices (non-critical), and
writes a structured result plus updated status back to Firestore. The client then
displays warnings/recommendations separately from blocking critical issues, and
reflects the updated status. The same validation logic also runs once per day via a
scheduled job over any still-unvalidated skills, without any user action.

## Tasks

| Task   | Module   | Status | Description                                        |
| ------ | -------- | ------ | ----------------------------------------------------- |
| SS-421 | frontend | ready  | Validate button triggers on-demand validation        |
| SS-422 | frontend | draft  | Structured display of warnings vs critical issues    |
| SS-423 | frontend | draft  | Reflect updated validation status in UI              |
| SS-601 | backend  | ready  | LLM validation core (security + conventions)         |
| SS-602 | backend  | draft  | Best-practice checks & structured result output      |
| SS-603 | backend  | ready  | On-demand validation for owners                      |
| SS-604 | backend  | draft  | Daily scheduled validation of unvalidated skills      |

## E2E test scenarios

### E2E-1: Golden path — owner validates and sees structured results

**Given** an owner with a pending skill that has one best-practice issue and no
critical issues
**When** they click Validate
**Then** the latest GitHub version is fetched and validated, the skill's status updates
to `approved`, and the UI shows the best-practice recommendation as a non-blocking
warning
**And** the same skill now appears in story-catalog-search's public results.

### E2E-2: Critical negative — critical issue blocks approval

**Given** a skill with a security issue an LLM check should flag as critical
**When** the owner triggers validation
**Then** the status updates to `failed`, the UI clearly separates the blocking critical
issue from any non-critical recommendations
**And** the skill does not appear in public search results.

### E2E-3: Permission boundary — non-owner cannot trigger validation

**Given** a logged-in user who does not own a given repository/skill
**When** they attempt to trigger validation for it (via UI or direct function call)
**Then** the request is rejected
**And** the repository's status and last-validated timestamp are unchanged. Separately,
the daily scheduled job runs without any user present and updates only skills that are
still unvalidated, never re-validating already-approved/failed skills unless requested.

## Dependencies

- Depends on: story-upload-repo, story-auth-profile, story-foundation-registry-model
- Used by: (none)
