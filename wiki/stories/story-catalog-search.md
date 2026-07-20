---
id: story-catalog-search
title: Browse & Search Validated Skills
status: planned
domain: frontend, backend, platform
created: 2026-07-19
updated: 2026-07-19
---

# Story: Browse & Search Validated Skills

## User story

As any visitor (logged in or not), I want to search for skills and repositories, so
that I can find and evaluate ones that have already passed validation.

## Workflow

A visitor opens the catalog page — no login required. The page's route loader calls
the backend's list/search function, which returns only repositories (and their skills)
whose calculated validation status is `validated`, each enriched with live GitHub data
(stars, etc.) blended in on top of the stored Firestore fields. The visitor can search
across both individual skills and whole repositories by name. Because this is the first
page in the app, it's also where routing itself gets set up, and where the Firestore
schema + security posture (deny-all client access — only Cloud Functions ever touch the
database) get established, since every later story reads or writes through this same
schema.

## Tasks

| Task   | Module   | Status | Description                                            |
| ------ | -------- | ------ | -------------------------------------------------------- |
| SS-101 | backend  | ready  | Repository & skills schema + validated-only query        |
| SS-102 | platform | ready  | `firestore.rules` deny-all                                |
| SS-103 | backend  | ready  | GitHub metadata enrichment for search                     |
| SS-104 | frontend | ready  | React Router v8 setup + catalog/search page               |

## E2E test scenarios

### E2E-1: Golden path — search finds a validated skill

**Given** a repository in Firestore with calculated status `validated` and one skill
named "frontend-design"
**When** a visitor (not logged in) searches "frontend-design" on the catalog page
**Then** the result appears, showing both the stored description and live GitHub stars
**And** no unvalidated repository or skill appears anywhere in the results.

### E2E-2: Critical negative — nothing passes validation yet

**Given** Firestore contains only `pending`/`failed` repositories, none `validated`
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

- Depends on: (none — baseline)
- Used by: story-auth-profile, story-upload-repo, story-validate-skill,
  story-cli-install-new, story-cli-install-update
