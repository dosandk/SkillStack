---
id: story-upload-repo
title: Upload a Repository/Skill for Validation
status: planned
domain: frontend, backend
created: 2026-07-10
updated: 2026-07-10
---

# Story: Upload a Repository/Skill for Validation

## User story

As a logged-in user, I want to submit a GitHub URL for my repository or skill, so that
it's tracked in the registry and appears with pending status while awaiting validation.

## Workflow

A logged-in user enters a GitHub URL in the upload form and submits it. The client
calls a Cloud Function that checks Firestore for an existing entry for that repo: if
none exists, it creates a repository document (plus its skills subcollection) with
`pending` status and the caller recorded as owner; if one already exists, it reuses/
updates it rather than duplicating. The client then shows the entry as pending. Upload
is gated to authenticated users both in the UI and by Firestore security rules.

## Tasks

| Task   | Module   | Status | Description                                                        |
| ------ | -------- | ------ | -------------------------------------------------------------------- |
| SS-411 | frontend | ready  | URL upload input & submission (calls the create-entry function)    |
| SS-412 | backend  | ready  | Create-entry function: dedup existing repo, record owner, set pending |
| SS-413 | frontend | draft  | Restrict upload UI to authenticated users                          |

## E2E test scenarios

### E2E-1: Golden path — new repository uploaded as pending

**Given** a logged-in user and a GitHub repository URL never submitted before
**When** they submit the URL through the upload form
**Then** a repository entry and its skills subcollection are created with `pending`
status, owned by that user
**And** the UI shows the new entry marked pending immediately after submission.

### E2E-2: Critical negative — duplicate upload does not create a second entry

**Given** a repository already present in the registry
**When** the same URL is uploaded again (by the same or a different user)
**Then** the existing entry is reused/updated rather than a duplicate being created
**And** the submitting user is informed it already exists.

### E2E-3: Permission boundary — anonymous upload rejected

**Given** a visitor who is not logged in
**When** they attempt to submit a URL through the upload form or call the create-entry
function directly
**Then** the UI hides/disables the upload action and the backend rejects the call via
the security rules from story-foundation-registry-model
**And** no registry entry is created.

## Dependencies

- Depends on: story-auth-profile, story-foundation-registry-model
- Used by: story-validate-skill
