---
id: feature-validation-engine
title: Validation — LLM Skill Validation
status: planned
owner: @unassigned
domain: validation
created: 2026-07-10
updated: 2026-07-10
---

# Feature: Validation — LLM Skill Validation

## Description

LLM-driven validation (e.g. via the Anthropic SDK) that checks a skill for security
issues and adherence to documented conventions (critical, blocking) as well as best
practices (non-critical recommendations/warnings). Validation always fetches the
latest version from GitHub. It runs on demand when a logged-in owner requests it for
their own skill or repository, and automatically once per day for unvalidated skills.
Results are persisted as structured status plus categorized findings.

## Tickets

| Ticket | Status  | Description                                        |
| ------ | ------- | -------------------------------------------------- |
| SS-601 | ready   | LLM validation core (security + conventions)       |
| SS-602 | draft   | Best-practice checks & structured result output    |
| SS-603 | ready   | On-demand validation for owners                    |
| SS-604 | draft   | Daily scheduled validation of unvalidated skills   |

## Dependencies

- Depends on: feature-backend-firestore-model, feature-backend-functions
- Used by: feature-ui-validation-results
