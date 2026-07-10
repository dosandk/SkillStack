---
id: feature-backend-firestore-model
title: Backend — Firestore Data Model
status: planned
owner: @unassigned
domain: backend
created: 2026-07-10
updated: 2026-07-10
---

# Feature: Backend — Firestore Data Model

## Description

The Firestore schema that backs the registry. A single top-level collection holds one
document per repository (owner reference, repository reference, GitHub commit hash,
short README-derived description, calculated repo-level validation status, calculated
installation count, and created/updated timestamps). Each repository document has a
`skills` subcollection where every skill carries a name, validation status
(pending/approved/failed), installation count from telemetry, and timestamps. No skill
files are stored physically — only the commit hash. Security rules restrict writes to
the authenticated owner and telemetry/validation functions.

## Tickets

| Ticket | Status  | Description                                            |
| ------ | ------- | ------------------------------------------------------ |
| SS-501 | ready   | Repository document schema                             |
| SS-502 | ready   | Skills subcollection schema                            |
| SS-503 | draft   | Calculated repo validation status & install count      |
| SS-504 | ready   | Firestore security rules for repos & skills            |

## Dependencies

- Depends on: feature-foundation-platform
- Used by: feature-backend-functions, feature-validation-engine
