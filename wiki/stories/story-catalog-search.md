---
id: story-catalog-search
title: Browse & Search Validated Skills
status: planned
domain: frontend, backend
created: 2026-07-10
updated: 2026-07-10
---

# Story: Browse & Search Validated Skills

## User story

As any visitor (logged in or not), I want to search and browse skills and repositories
that have passed validation, with up-to-date GitHub metadata, so that I can find
trustworthy skills to install.

## Workflow

The client renders skills as cards with free-text search, tag/agent filtering, and
sort tabs (Trending/Hot/All Time). Card data and search results are backed by a public
Cloud Function that returns only validated repositories/skills from Firestore, merged
live with GitHub metadata (e.g. stars) fetched via the GitHub API at request time.

An earlier iteration of this UI (SS-201/202/203) was built against the legacy
`db/content` mock data source, which no longer exists. Treat that implementation as a
reference for markup/interaction patterns only — none of it is done against the new
Firestore/Cloud-Functions-backed data model, so it needs a rewrite, not a reuse.

## Tasks

| Task   | Module   | Status | Description                                          |
| ------ | -------- | ------ | ------------------------------------------------------ |
| SS-201 | frontend | ready  | Skill listing as cards                                 |
| SS-202 | frontend | ready  | Free-text search + tag/agent filtering                 |
| SS-203 | frontend | ready  | Sort tabs (Trending/Hot/All Time) + status badges      |
| SS-401 | frontend | ready  | Search & view validated skills (wired to real data)    |
| SS-402 | frontend | ready  | Search repositories                                    |
| SS-403 | frontend | draft  | Show live GitHub metadata (stars) in results           |
| SS-513 | backend  | draft  | GitHub API enrichment (stars & live metadata)          |
| SS-514 | backend  | draft  | Public search endpoint for validated content           |

## E2E test scenarios

### E2E-1: Golden path — search returns validated results with live stars

**Given** a validated skill and an unvalidated skill both matching a search term
**When** an anonymous visitor searches for that term
**Then** only the validated skill appears, shown with its current GitHub star count
**And** the star count reflects a live GitHub API call, not stale stored data.

### E2E-2: Critical negative — GitHub enrichment unavailable

**Given** the GitHub API is unreachable when a search is performed
**When** the visitor searches or browses
**Then** results still render using stored Firestore data, with metadata gracefully
omitted or marked stale rather than the whole search failing
**And** the failure is not surfaced as a broken page.

### E2E-3: Permission boundary — pending/failed content never shown

**Given** repositories in `pending` and `failed` validation states
**When** any visitor (logged in or not) searches or browses the catalog
**Then** neither appears in results regardless of search term or filter
**And** this holds even when the visitor is the owner of that unvalidated content
(they'd see it via their own profile, not the public catalog).

## Dependencies

- Depends on: story-foundation-registry-model
- Used by: (none)
