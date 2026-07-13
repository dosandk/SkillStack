---
id: story-cli-install-new
title: CLI — Install Skills from a Repo (first-time)
status: planned
domain: cli, backend
created: 2026-07-10
updated: 2026-07-10
---

# Story: CLI — Install Skills from a Repo (first-time)

## User story

As a developer, I want to run `npx skillstack add <repo-url> [--skill <name>]` against
a repository I've never installed from before, so that the requested skill(s) get
installed into my project, with a clear warning if the repo isn't yet validated.

## Workflow

The CLI scans the target GitHub repository for `SKILL.md` files up to 3 nested levels
deep (root, `/skills/<name>/`, `/skills/<group>/<name>/`); if `--skill` wasn't given, it
lists everything found for the user to choose from. Once skill(s) are selected, the CLI
calls a Cloud Function that looks up the repository in Firestore — since it's unknown,
the CLI warns the user the repo is unvalidated and asks them to confirm before
proceeding. On confirmation, the CLI prompts for target platforms (Claude, Cursor,
Copilot — multi-select) and copies each selected skill's full directory into the
right platform folder(s). After install, the CLI calls a telemetry Cloud Function that
records the installation and marks the repo/skills in Firestore as awaiting validation.

## Tasks

| Task   | Module  | Status | Description                                         |
| ------ | ------- | ------ | ------------------------------------------------------ |
| SS-301 | cli     | ready  | Repository scan for SKILL.md up to depth 3 & list discovered skills |
| SS-303 | cli     | ready  | Capture full skill directory contents                  |
| SS-311 | cli     | ready  | Multi-select target platform prompt & install skill directory into platform folders |
| SS-313 | cli     | ready  | Multiple skill selection in one run                     |
| SS-321 | cli     | ready  | Firestore lookup call + unvalidated-repo warning        |
| SS-331 | cli     | ready  | Post-install telemetry request                         |
| SS-332 | backend | draft  | Mark installed repo/skills as awaiting validation      |
| SS-511 | backend | ready  | Repository lookup function (commit hash + statuses)    |
| SS-512 | backend | ready  | Telemetry recording function                           |

## E2E test scenarios

### E2E-1: Golden path — install a skill from a brand-new repo

**Given** a public GitHub repo never seen by the registry, with one `SKILL.md` at
`/skills/frontend-design/`
**When** the user runs `npx skillstack add <repo-url> --skill frontend-design`, sees
the unvalidated-repo warning, confirms, and picks "Claude" as the target platform
**Then** the `frontend-design` directory is installed into the Claude skills folder in
the local project
**And** a telemetry call records the install and marks the repo/skill as pending in
Firestore.

### E2E-2: Critical negative — lookup service unreachable

**Given** the registry lookup Cloud Function is unreachable
**When** the CLI attempts the pre-install lookup
**Then** it surfaces a clear error and lets the user decide whether to proceed without
that information, rather than silently treating the repo as validated
**And** no install proceeds without explicit user confirmation in that state.

### E2E-3: Permission/edge boundary — no SKILL.md found, or nested past depth 3

**Given** a repo with no `SKILL.md` within 3 levels, or only one nested at depth 4
**When** the user runs the add command against it (with or without `--skill`)
**Then** the CLI reports that no installable skills were found
**And** it does not install anything nested deeper than the allowed 3 levels.

## Dependencies

- Depends on: story-foundation-registry-model
- Used by: story-cli-install-update
