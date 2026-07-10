---
id: feature-cli-install
title: CLI — Skill Installation
status: planned
owner: @unassigned
domain: cli
created: 2026-07-10
updated: 2026-07-10
---

# Feature: CLI — Skill Installation

## Description

After skills are selected, the CLI prompts the user to choose one or more target
platforms (Claude, Cursor, Copilot) and installs each selected skill's directory into
the correct platform-specific folder in the local project. Supports installing
multiple skills in a single run.

## Tickets

| Ticket | Status  | Description                                     |
| ------ | ------- | ----------------------------------------------- |
| SS-311 | ready   | Multi-select target platform prompt             |
| SS-312 | ready   | Install skill directory into platform folders   |
| SS-313 | ready   | Multiple skill selection in one run             |

## Dependencies

- Depends on: feature-cli-discovery
- Used by: feature-cli-registry-integration
