---
id: feature-auth-github
title: Authentication — GitHub Login
status: done
owner: @unassigned
domain: auth
created: 2026-07-10
updated: 2026-07-10
---

# Feature: Authentication — GitHub Login

## Description

GitHub OAuth sign-in for the web app. Authenticated identity gates the write-path
features (upload, validate, profile) and is used to establish repository ownership.
Login is implemented and working in production.

## Tickets

| Ticket | Status | Description                          |
| ------ | ------ | ------------------------------------ |
| SS-101 | done   | GitHub OAuth login flow              |
| SS-102 | done   | Client-side auth state & session guard |

## Dependencies

- Depends on: feature-foundation-platform
- Used by: feature-ui-upload, feature-ui-profile, feature-ui-validation-results
