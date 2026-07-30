---
id: story-favorites
title: Favorites & Sharing
status: planned
domain: frontend, backend
created: 2026-07-30
updated: 2026-07-30
---

# Story: Favorites & Sharing

## User story

As a logged-in user, I want to favorite repositories or individual skills and share my collection, so that I (and others via link) can quickly access curated skill sets.

## Workflow

A logged-in user browses the catalog and clicks a "favorite" button on either a full repo (all skills) or individual skills. These favorites are stored in a per-user `userFavorites` collection ([AD-14](../architecture-invariants.md#ad-14)). The user can view their "Favorites" tab showing all favorited items — repos appear with all their skills if favorited fully, or just the selected skills if favorited partially (determined by empty vs. non-empty `skillNames` array). From the favorites page, the user can generate a shareable link. Anyone with that link (logged in or not) can view the favorites collection in the UI. The CLI can also install skills directly from a shared favorites link via `npx skillstack add <favorites-link>`, which calls the public read endpoint and installs the listed skills.

## Tasks

| Task   | Module   | Status | Description                                         |
| ------ | -------- | ------ | ------------------------------------------------------ |
| SS-105 | backend  | ready  | Favorites collection schema (userFavorites)            |
| SS-106 | backend  | ready  | Shareable link generation logic                        |
| SS-305 | backend  | ready  | User-favorites store (CRUD + public read by link)      |
| SS-306 | frontend | ready  | Favorite button UI (catalog + detail pages)            |
| SS-307 | frontend | ready  | Favorites tab UI                                       |
| SS-308 | frontend | ready  | Share favorites link generator                         |
| SS-309 | frontend | ready  | Public favorites viewer (link-based access)            |
| SS-310 | cli      | ready  | CLI favorites link support (`add <favorites-link>`)    |

## E2E test scenarios

### E2E-1: Golden path — favorite a full repo and share

**Given** a logged-in user browsing a validated repo with two skills
**When** they click "favorite" on the repo itself (not individual skills), then navigate to their Favorites tab and generate a share link
**Then** the Favorites tab shows the repo with both skills listed
**And** the share link, when visited by an anonymous user, displays the same repo and skills
**And** `npx skillstack add <share-link>` installs both skills from that repo.

### E2E-2: Critical negative — favoriting while signed out

**Given** a visitor who is not logged in
**When** they attempt to favorite a repo or skill (e.g. by calling the endpoint directly)
**Then** the request is rejected before any Firestore write occurs
**And** no favorite entry is created.

### E2E-3: Permission/edge boundary — viewing someone else's favorites without a link

**Given** User A has favorited several repos
**And** User B is logged in as a different user
**When** User B tries to access User A's favorites directly (e.g. by guessing the user ID)
**Then** the request is rejected (only the share link or the owning user can read)
**And** User B sees no unauthorized data.

## Dependencies

- Depends on: story-cli-install-flows (`scanRepository` from SS-301), story-catalog-search (routing), story-auth-profile (logged-in user identity)
- Used by: (none — leaf story)
