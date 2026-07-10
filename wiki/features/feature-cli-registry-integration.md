---
id: feature-cli-registry-integration
title: CLI — Registry Integration
status: planned
owner: @unassigned
domain: cli
created: 2026-07-10
updated: 2026-07-10
---

# Feature: CLI — Registry Integration

## Description

Before installing, the CLI calls a Cloud Function that checks Firestore for the
repository. If the repository is unknown, the CLI warns that it is unvalidated and the
user proceeds at their own discretion. If it is known, the function returns the stored
commit hash and per-skill validation status. When the repository's latest commit
differs from the stored hash: an unvalidated stored version installs like a new repo,
while an already-validated stored version prompts the user to choose which version
(validated stored vs. updated latest) to install.

## Tickets

| Ticket | Status  | Description                                          |
| ------ | ------- | ---------------------------------------------------- |
| SS-321 | ready   | Firestore lookup call + unvalidated-repo warning     |
| SS-322 | draft   | Commit-hash update detection                         |
| SS-323 | draft   | Version choice for validated repos with changes      |

## Dependencies

- Depends on: feature-cli-install, feature-backend-functions
- Used by: feature-cli-telemetry
