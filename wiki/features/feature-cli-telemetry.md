---
id: feature-cli-telemetry
title: CLI — Install Telemetry
status: planned
owner: @unassigned
domain: cli
created: 2026-07-10
updated: 2026-07-10
---

# Feature: CLI — Install Telemetry

## Description

After a successful installation the CLI triggers telemetry by calling a Cloud
Function. The function records that the repository was used and the installation
completed, increments installation counts, and marks the repository with the specified
set of skills (or single skill) as awaiting later validation.

## Tickets

| Ticket | Status  | Description                                     |
| ------ | ------- | ----------------------------------------------- |
| SS-331 | ready   | Post-install telemetry request                  |
| SS-332 | draft   | Mark installed repo/skills as awaiting validation |

## Dependencies

- Depends on: feature-cli-registry-integration, feature-backend-functions
- Used by: (none)
