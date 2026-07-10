---
id: feature-ui-validation-results
title: UI — Validation & Results
status: planned
owner: @unassigned
domain: ui
created: 2026-07-10
updated: 2026-07-10
---

# Feature: UI — Validation & Results

## Description

A logged-in user validates their repository or an individual skill via a Validate
button, which triggers on-demand validation (always against the latest GitHub
version). The UI then displays the resulting status and presents findings in a
structured form: non-critical recommendations/warnings separately from critical issues
that block the skill(s) from passing. Restricted to the content owner.

## Tickets

| Ticket | Status  | Description                                       |
| ------ | ------- | ------------------------------------------------- |
| SS-421 | ready   | Validate button triggers on-demand validation     |
| SS-422 | draft   | Structured display of warnings vs critical issues  |
| SS-423 | draft   | Reflect updated validation status in UI            |

## Dependencies

- Depends on: feature-ui-upload, feature-validation-engine, feature-auth-github
- Used by: (none)
