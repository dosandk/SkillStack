---
id: story-upload-repo
title: Upload a Repository
status: planned
domain: frontend, backend
created: 2026-07-19
updated: 2026-07-19
---

# Story: Upload a Repository

## User story

As a logged-in user, I want to submit my repository's URL, so that its skill(s) get
registered and appear with pending status while awaiting validation.

## Workflow

A logged-in user pastes a GitHub repo URL into the upload page. The client sends it,
with their auth token, to the backend. The backend scans the repo (the same
`scanRepository` discovery function the CLI also calls — one implementation of the
SKILL.md/depth-3 rule, shared by both surfaces), verifies the caller's identity from the
token, and creates a repository document plus one skill document per discovered skill,
all marked `pending`. The UI then shows the repo and its skill(s) in that pending state,
ready for the next story (Validate) to act on.

## Tasks

| Task   | Module   | Status | Description                                         |
| ------ | -------- | ------ | ------------------------------------------------------ |
| SS-301 | backend  | ready  | `scanRepository` Cloud Function                        |
| SS-302 | backend  | ready  | Owner-scoped upload endpoint                           |
| SS-303 | frontend | ready  | Upload UI                                              |

## E2E test scenarios

### E2E-1: Golden path — upload a new repository

**Given** a logged-in user and a public repo with two `SKILL.md` files within depth 3
**When** they submit that repo's URL on the upload page
**Then** a repository document and two skill documents are created, all `pending`
**And** the UI immediately shows the repo with both skills listed as pending.

### E2E-2: Critical negative — upload while signed out

**Given** a visitor who is not logged in
**When** they attempt to submit a repo URL (e.g. by navigating to the upload route
directly, or with a stripped/invalid auth token)
**Then** the request is rejected before any Firestore write occurs
**And** no repository or skill document is created.

### E2E-3: Permission/edge boundary — repo with no discoverable skills

**Given** a repo with no `SKILL.md` within 3 nesting levels
**When** a logged-in user submits its URL
**Then** the UI reports that no installable skills were found
**And** no repository/skill documents are created for it.

## Dependencies

- Depends on: story-catalog-search, story-auth-profile
- Used by: story-validate-skill, story-cli-install-new (shares `scanRepository`)
