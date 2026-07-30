---
id: story-catalog-search
title: Browse & Search Validated Skills
status: planned
domain: frontend, backend, platform
created: 2026-07-19
updated: 2026-07-29
---

# Story: Browse & Search Validated Skills

## User story

As any visitor (logged in or not), I want to search for skills and repositories, so
that I can find and evaluate ones that have already passed validation.

## Workflow

A visitor opens the catalog page — no login required. The page's route loader calls
the backend's list/search function, which returns only repositories (and their skills)
whose calculated validation status is `validated` from the stored Firestore fields. Each list item
shows lightweight GitHub metadata (stars count, last updated date) via SS-103's enrichment. The visitor can search
across both individual skills and whole repositories by name. Clicking an item navigates to its detail page (SS-106),
which shows full information: install instructions, README content, complete GitHub metadata (contributors, issues),
validation findings, and a file tree preview. Routing itself gets set up here,
along with the security posture (`firestore.rules` deny-all client access — only Cloud Functions ever touch the database, [AD-1](../architecture-invariants.md#ad-1)).

## Tasks

| Task   | Module   | Status | Description                                                |
| ------ | -------- | ------ | ---------------------------------------------------------- |
| SS-102 | platform | ready  | `firestore.rules` deny-all                                 |
| SS-103 | backend  | ready  | GitHub metadata enrichment (catalog list + detail pages)   |
| SS-104 | frontend | ready  | React Router v8 setup + catalog/search page                |
| SS-107 | frontend | ready  | Catalog detail page (repo/skill view)                      |

## E2E test scenarios

### E2E-1: Golden path — search finds a validated skill

**Given** a repository in Firestore with calculated status `"validated"` and one skill
named "frontend-design"
**When** a visitor (not logged in) searches "frontend-design" on the catalog page
**Then** the result appears, showing the stored description, stars count, and last updated date
**And** clicking the item navigates to its detail page (SS-107) with install instructions, README, and full metadata
**And** no unvalidated repository or skill appears anywhere in the results.

### E2E-2: Critical negative — nothing passes validation yet

**Given** Firestore contains only `"pending"`/`"failed"` repositories, none `"validated"`
**When** a visitor searches anything
**Then** the catalog shows a clear empty state
**And** no pending/failed content is exposed to the public search.

### E2E-3: Permission/edge boundary — direct Firestore access attempt

**Given** the deployed `firestore.rules`
**When** any client (authenticated or not) attempts to read or write Firestore directly,
bypassing the Cloud Functions API
**Then** the request is denied
**And** the catalog page continues to work normally through the Cloud Functions API.

## Dependencies

- Depends on: story-cli-install-flows (Firestore schema from SS-101)
- Used by: story-auth-profile, story-favorites, story-validate-skill
