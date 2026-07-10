---
id: feature-cli-discovery
title: CLI — Skill Discovery
status: planned
owner: @unassigned
domain: cli
created: 2026-07-10
updated: 2026-07-10
---

# Feature: CLI — Skill Discovery

## Description

The CLI scans a GitHub repository via the GitHub API to find skills, defined by a
`SKILL.md` file located at most three levels deep (repo root, `/skills/<name>/`, or
`/skills/<group>/<name>/`). Deeper nesting is ignored. When no `--skill` is specified
the CLI lists all discovered skills for the user to choose from. Once a `SKILL.md` is
found, the entire containing skill directory (including all subdirectories, regardless
of depth) is captured for installation.

## Tickets

| Ticket | Status  | Description                                    |
| ------ | ------- | ---------------------------------------------- |
| SS-301 | ready   | Repository scan for SKILL.md up to depth 3     |
| SS-302 | ready   | List discovered skills when none specified     |
| SS-303 | ready   | Capture full skill directory contents          |

## Dependencies

- Depends on: feature-foundation-platform
- Used by: feature-cli-install
