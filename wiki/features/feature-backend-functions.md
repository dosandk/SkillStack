---
id: feature-backend-functions
title: Backend — Cloud Functions API
status: planned
owner: @unassigned
domain: backend
created: 2026-07-10
updated: 2026-07-10
---

# Feature: Backend — Cloud Functions API

## Description

The Cloud Functions layer that the CLI and UI call. It provides a repository lookup
endpoint (returns stored commit hash and per-skill validation status), a telemetry
endpoint (records installations and marks the repo/skills as awaiting validation), a
GitHub API enrichment path (live metadata such as stars merged with stored data), and
a public search endpoint that returns only validated skills and repositories.

## Tickets

| Ticket | Status  | Description                                          |
| ------ | ------- | ---------------------------------------------------- |
| SS-511 | ready   | Repository lookup function (commit hash + statuses)  |
| SS-512 | ready   | Telemetry recording function                         |
| SS-513 | draft   | GitHub API enrichment (stars & live metadata)        |
| SS-514 | draft   | Public search endpoint for validated content         |

## Dependencies

- Depends on: feature-backend-firestore-model
- Used by: feature-cli-registry-integration, feature-cli-telemetry, feature-ui-search-discovery, feature-ui-upload
