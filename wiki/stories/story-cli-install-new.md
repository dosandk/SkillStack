---
id: story-cli-install-new
title: CLI — Install Skills from a Repo (first-time)
status: planned
domain: cli, backend
created: 2026-07-19
updated: 2026-07-19
---

# Story: CLI — Install Skills from a Repo (first-time)

## User story

As a developer, I want to run `npx skillstack add <repo-url> [--skill <name>]` against
a repository I've never installed from before, so that the requested skill(s) get
installed into my project, with a clear warning if the repo isn't yet validated.

## Workflow

The CLI calls the backend's `scanRepository` function with the repo URL — the same
discovery function the web upload flow uses, so there's exactly one implementation of
the SKILL.md/depth-3 rule. If the repo is unknown to the registry, the CLI warns the
user it's unvalidated and asks for confirmation before continuing. If `--skill` wasn't
given, it lists every skill the scan discovered for the user to pick from. Once skill(s)
are selected and confirmed, the CLI fetches each one's actual file content directly from
GitHub (not through the backend — keeps bandwidth on the user's own connection),
prompts for target platform(s) (Claude, Cursor, Copilot — multi-select), and writes each
skill's full directory into the right platform folder(s). Finally it calls a telemetry
function that records the install and marks the repo/skill(s) as awaiting validation.

## Tasks

| Task   | Module  | Status | Description                                                          |
| ------ | ------- | ------ | ------------------------------------------------------------------------ |
| SS-501 | cli     | ready  | `add` command calls `scanRepository`; unvalidated-repo warning; skill selection |
| SS-502 | cli     | ready  | Platform target selection + file placement                               |
| SS-503 | cli     | ready  | Direct-to-GitHub content download for selected skill(s)                   |
| SS-504 | backend | ready  | Telemetry Cloud Function                                                  |

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

### E2E-2: Critical negative — backend scan unreachable

**Given** the `scanRepository` Cloud Function is unreachable
**When** the CLI attempts the scan
**Then** it surfaces a clear error and does not proceed to install anything
**And** it does not silently treat the repo as validated or as containing no skills.

### E2E-3: Permission/edge boundary — no SKILL.md found, or nested past depth 3

**Given** a repo with no `SKILL.md` within 3 levels, or only one nested at depth 4
**When** the user runs the add command against it (with or without `--skill`)
**Then** the CLI reports that no installable skills were found
**And** nothing nested deeper than the allowed 3 levels is ever installed.

## Dependencies

- Depends on: story-catalog-search, story-upload-repo (shares `scanRepository`)
- Used by: story-cli-install-update
