---
id: story-cli-install-update
title: CLI — Reinstall/Update an Already-Tracked Repo
status: planned
domain: cli, backend
created: 2026-07-19
updated: 2026-07-19
---

# Story: CLI — Reinstall/Update an Already-Tracked Repo

## User story

As a developer, I want to re-run `npx skillstack add <repo-url>` against a repo I've
already installed from, so that I'm told about upstream changes and can choose the
right version instead of silently getting stale or unexpectedly different content.

## Workflow

The CLI calls `scanRepository` as usual; this time the response says the repo is known,
with its stored commit hash and per-skill validation status. If the commit hash matches
what was last installed, nothing special happens — install proceeds normally. If it
differs and the repo's stored status is `validated`, the CLI tells the user the repo has
changed and lets them choose: install the stored (validated) version, or the new latest
one. If it differs and the repo isn't validated yet, the CLI just installs the latest
version directly, same as a first-time install — no need to ask, since there was no
validated baseline to protect. Either way, a successful reinstall re-fires the same
telemetry call as a first-time install, marking things pending again if changed.

## Tasks

| Task   | Module  | Status | Description                                                        |
| ------ | ------- | ------ | ----------------------------------------------------------------------- |
| SS-601 | backend | ready  | Repo-status response contract                                            |
| SS-602 | cli     | ready  | Commit-diff comparison + choice prompt (validated + changed)              |
| SS-603 | cli     | ready  | Auto-install-latest path (not yet validated + changed) + telemetry re-fire |

## E2E test scenarios

### E2E-1: Golden path — validated repo has a new commit, user picks latest

**Given** a repo previously installed at commit `abc123`, now at `def456`, with stored
status `validated`
**When** the user re-runs `npx skillstack add <repo-url>` and chooses "latest" at the
prompt
**Then** the new commit's content is installed
**And** telemetry records the reinstall and marks the repo/skill(s) pending again.

### E2E-2: Critical negative — user picks stored version, but it's gone from GitHub

**Given** the same scenario as E2E-1, but the user chooses "stored" and that exact
commit is no longer resolvable on GitHub (force-pushed history, etc.)
**When** the CLI attempts to fetch it
**Then** it surfaces a clear error rather than silently falling back to latest
**And** no partial install occurs.

### E2E-3: Permission/edge boundary — not-yet-validated repo has changed

**Given** a repo previously installed at commit `abc123`, now at `def456`, with stored
status `pending` (never validated)
**When** the user re-runs the add command
**Then** the latest version installs directly, with no choice prompt
**And** telemetry still records the reinstall.

## Dependencies

- Depends on: story-cli-install-new
- Used by: (none — leaf story)
