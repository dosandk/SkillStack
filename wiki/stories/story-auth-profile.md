---
id: story-auth-profile
title: GitHub Login & Profile
status: partial
domain: frontend, backend
created: 2026-07-10
updated: 2026-07-10
---

# Story: GitHub Login & Profile

## User story

As a visitor, I want to log in with my GitHub account and see my profile with the
repositories/skills I've uploaded, so that I have a persistent identity the rest of the
app can use to gate ownership actions.

## Workflow

The user signs in via GitHub OAuth; the client establishes and persists session state
and guards authenticated routes. On the profile page, the client fetches the logged-in
user's GitHub info (from the auth provider) and calls a Cloud Function that queries
Firestore for every repository owned by that user's GitHub identity, returning each
entry's current validation status for display.

## Tasks

| Task   | Module   | Status | Description                                       |
| ------ | -------- | ------ | --------------------------------------------------- |
| SS-101 | frontend | done   | GitHub OAuth login flow                            |
| SS-102 | frontend | done   | Client-side auth state & session guard             |
| SS-431 | frontend | ready  | Profile page with GitHub information               |
| SS-432 | frontend | draft  | Render list of user's uploaded skills/repos        |
| SS-433 | backend  | draft  | Query repositories owned by the authenticated user |

## E2E test scenarios

### E2E-1: Golden path — login and view profile with uploads

**Given** a GitHub user who has previously uploaded two repositories
**When** they log in via GitHub and navigate to their profile page
**Then** the page shows their GitHub username/avatar and both repositories with each
one's current validation status
**And** the list matches exactly what SS-433's query returns for their uid.

### E2E-2: Critical negative — session expired mid-visit

**Given** a logged-in user whose session token has expired
**When** they navigate to the profile page
**Then** they are redirected to log in again rather than shown stale or partial data
**And** no profile data is fetched with the expired session.

### E2E-3: Permission boundary — cannot view another user's profile data

**Given** a logged-in user
**When** they attempt to query or navigate to another user's uploaded-repos data
**Then** the backend query is scoped to the caller's own uid and returns only their own
repositories
**And** no other user's private profile data is exposed.

## Dependencies

- Depends on: story-foundation-registry-model
- Used by: (none)
