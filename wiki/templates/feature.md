---
id: feature-auth-login
title: User Authentication — Login Flow
status: active
owner: @ivan
domain: auth
created: 2025-09-15
updated: 2026-01-10
---

# Feature: User Authentication — Login Flow

## Description

Email/password login with JWT access tokens and refresh token rotation.
Supports MFA via TOTP (optional, per-user setting).

## Tickets

| Ticket   | Status      | Description                |
| -------- | ----------- | -------------------------- |
| PROJ-101 | done        | Basic email/password login |
| PROJ-145 | done        | Refresh token rotation     |
| PROJ-203 | done        | MFA (TOTP) support         |
| PROJ-287 | in-progress | Login rate limiting        |

## Dependencies

- Depends on: feature-user-management (user registration)
- Used by: feature-billing-checkout (auth required for purchases)
