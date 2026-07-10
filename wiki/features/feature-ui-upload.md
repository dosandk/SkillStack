---
id: feature-ui-upload
title: UI — Repository/Skill Upload
status: planned
owner: @unassigned
domain: ui
created: 2026-07-10
updated: 2026-07-10
---

# Feature: UI — Repository/Skill Upload

## Description

A logged-in user submits a GitHub URL through an input field to upload their
repository or skill. On submission the entry (a single skill, or a repository with its
list of skills) is created in the registry with `pending` status and appears in the UI
awaiting validation. Upload is restricted to authenticated users.

## Tickets

| Ticket | Status  | Description                                 |
| ------ | ------- | ------------------------------------------- |
| SS-411 | ready   | URL upload input & submission               |
| SS-412 | ready   | Create pending-status registry entry        |
| SS-413 | draft   | Restrict upload to authenticated users      |

## Dependencies

- Depends on: feature-auth-github, feature-backend-functions
- Used by: feature-ui-validation-results
