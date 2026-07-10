---
id: feature-ui-search-discovery
title: UI — Search & Discovery
status: planned
owner: @unassigned
domain: ui
created: 2026-07-10
updated: 2026-07-10
---

# Feature: UI — Search & Discovery

## Description

Public, unauthenticated search and viewing of content that has passed validation.
Users can search both individual skills and entire repositories. Results combine the
stored commit hash and validation data from Firestore with up-to-date GitHub metadata
(such as stars) fetched live via the backend. Only validated entries are shown.

## Tickets

| Ticket | Status  | Description                                     |
| ------ | ------- | ----------------------------------------------- |
| SS-401 | ready   | Search & view validated skills                  |
| SS-402 | ready   | Search repositories                             |
| SS-403 | draft   | Show live GitHub metadata (stars) in results    |

## Dependencies

- Depends on: feature-catalog-browse, feature-backend-functions
- Used by: (none)
