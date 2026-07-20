---
id: story-auth-profile
title: GitHub Login & Profile
status: planned
domain: frontend
created: 2026-07-19
updated: 2026-07-19
---

# Story: GitHub Login & Profile

## User story

As a visitor, I want to log in with GitHub, so that I have an identity the app can use
to let me upload and manage my own repositories/skills.

## Workflow

The login mechanism (Firebase Auth + GitHub provider, dev emulator wiring) already
exists in `client/src/lib/firebase.ts` — nothing in the app reads that auth state yet.
This story adds the plumbing: a context that exposes the current signed-in user across
the app, a login/logout control, and a route guard that protects pages requiring login.
Once signed in, the user can visit their profile page and see their GitHub info (avatar,
name, profile link) pulled directly from the auth provider — no backend call needed.

## Tasks

| Task   | Module   | Status | Description                                    |
| ------ | -------- | ------ | ------------------------------------------------- |
| SS-201 | frontend | ready  | Auth context over Firebase Auth state             |
| SS-202 | frontend | ready  | Login flow + protected route guard                |
| SS-203 | frontend | ready  | Profile page                                       |

## E2E test scenarios

### E2E-1: Golden path — log in and view profile

**Given** a visitor not yet signed in
**When** they click "log in with GitHub," complete the GitHub OAuth flow, and navigate
to their profile page
**Then** the profile page displays their GitHub avatar, name, and profile link.

### E2E-2: Critical negative — visiting profile while signed out

**Given** a visitor who is not signed in
**When** they navigate directly to the profile route (e.g. via URL)
**Then** they're redirected away rather than seeing a broken or empty profile page.

### E2E-3: Permission/edge boundary — logout mid-session

**Given** a signed-in user viewing their profile
**When** they click logout
**Then** they're immediately treated as signed out
**And** navigating back to the profile route redirects them, same as E2E-2.

## Dependencies

- Depends on: story-catalog-search (routing setup)
- Used by: story-upload-repo, story-validate-skill
