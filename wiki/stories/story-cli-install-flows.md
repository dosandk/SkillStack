---
id: story-cli-install-flows
title: CLI — Install Skills (All Flows)
status: planned
domain: cli, backend
created: 2026-07-19
updated: 2026-07-30
---

# Story: CLI — Install Skills (All Flows)

## User story

As a developer, I want to run `npx skillstack add <repo-url> [--skill <name>]` against
any repository, so that the requested skill(s) get installed into my project with the
appropriate behavior based on whether it's a first-time install, a reinstall with or
without changes, or during an active validation.

## Workflow

The CLI calls the backend's `scanRepository` function ([AD-6](../architecture-invariants.md#ad-6)) with the repo URL and optional `--skill` argument — the same
discovery function the web favorites flow uses, so there's exactly one implementation of
the SKILL.md/depth-3 rule. Backend uses its own GitHub token (no rate limits), walks the tree, and returns
a unified response with discovered skills, metadata, AND file content ([AD-7](../architecture-invariants.md#ad-7)) — no separate GitHub fetch needed.

The flow branches based on the backend response:

### 1. First install (1.1)
Repo unknown to the registry → CLI warns the user it's unvalidated and asks for confirmation.
If `--skill` wasn't given, lists every discovered skill for the user to pick from. Once skill(s)
are selected and confirmed, the CLI extracts file content from the backend response (already base64-encoded),
prompts for target platform(s) (Claude, Cursor, Copilot — multi-select), and writes each
skill's full directory into the right platform folder(s). Finally it calls a telemetry
function that creates the repo + skills in Firestore with "pending" status, sets install counts, and
recalculates the aggregated install count.

### 2. Same commit (1.2.1)
Commit hash matches what's stored → CLI shows skills with their existing validation statuses.
User selects which to install. Backend increments install counts for the selections (sets "pending"
only for newly installed skills that weren't previously installed). CLI installs from backend response.

### 3. Different commit (1.2.2)
Commit hash differs and repo status is not "in progress" → CLI notifies user of new version.
If user chooses to proceed: backend updates commit hash in Firestore, diffs skills (removes deleted,
adds new, increments existing), recalculates aggregated install count, sets repo + all skills to "pending".
CLI installs from backend response.

### 4. Install during validation (1.2.3)
Commit hash differs and repo validation status is "in progress" → CLI installs directly from backend
response without any DB writes. No telemetry, no status changes — validation is actively running,
so we don't interfere.

## Tasks

| Task   | Module  | Status | Description                                                          |
| ------ | ------- | ------ | ------------------------------------------------------------------------ |
| SS-101 | backend | ready  | Firestore schema (repositories + skills subcollection with `"in progress"` status and `valid: boolean`) |
| SS-301 | backend | ready  | `scanRepository` Cloud Function (discovery + file content + commit comparison + `"in progress"` detection) |
| SS-501a | cli     | ready  | First install flow: call `scanRepository`, unvalidated-repo warning, skill selection, telemetry |
| SS-501b | cli     | ready  | Same commit flow: show validation statuses, install, increment counts |
| SS-501c | cli     | ready  | Different commit flow: notify user, update DB, recalculate counts, set `"pending"` |
| SS-501d | cli     | ready  | During validation flow: detect `"in progress"`, install without DB writes |
| SS-502 | cli     | ready  | Platform target selection + file placement                               |
| SS-503 | cli     | ready  | Extract and write skill files from backend response                   |
| SS-504 | backend | ready  | Telemetry Cloud Function                                                  |

## E2E test scenarios

### E2E-1: Golden path — first install from a brand-new repo

**Given** a public GitHub repo never seen by the registry, with one `SKILL.md` at
`/skills/frontend-design/`
**When** the user runs `npx skillstack add <repo-url> --skill frontend-design`, sees
the unvalidated-repo warning, confirms, and picks "Claude" as the target platform
**Then** the `frontend-design` directory is installed into the Claude skills folder in
the local project
**And** a telemetry call creates the repo + skill in Firestore with "pending" status,
sets install count to 1, and calculates aggregated install count.

### E2E-2: Same commit reinstall

**Given** a repo previously installed at commit `abc123`, backend returns same commit hash
**When** the user re-runs `npx skillstack add <repo-url>` and selects a skill
**Then** the skill is installed
**And** telemetry increments the install count for that skill (sets "pending" only if it's
a newly installed skill).

### E2E-3: Different commit with user choosing to proceed

**Given** a repo previously installed at commit `abc123`, now at `def456`, with stored
status not "in progress"
**When** the user re-runs `npx skillstack add <repo-url>`, sees the "new version" message,
and chooses to proceed
**Then** the new commit's content is installed
**And** backend updates commit hash, diffs skills, recalculates install counts, sets repo
+ all skills to "pending".

### E2E-4: Install during validation

**Given** a repo previously installed at commit `abc123`, now at `def456`, with stored
status "in progress"
**When** the user runs `npx skillstack add <repo-url>`
**Then** the latest content is installed directly
**And** no DB writes occur (no telemetry, no status changes).

### E2E-5: Critical negative — backend scan unreachable

**Given** the `scanRepository` Cloud Function is unreachable
**When** the CLI attempts the scan
**Then** it surfaces a clear error and does not proceed to install anything
**And** it does not silently treat the repo as validated or as containing no skills.

### E2E-6: Permission/edge boundary — no SKILL.md found, or nested past depth 3

**Given** a repo with no `SKILL.md` within 3 levels, or only one nested at depth 4
**When** the user runs the add command against it (with or without `--skill`)
**Then** the CLI reports that no installable skills were found
**And** nothing nested deeper than the allowed 3 levels is ever installed.

## Dependencies

- Depends on: (none — foundational story implementing Firestore schema, four-branch `scanRepository`, and all install flows)
- Used by: story-catalog-search (reads schema), story-favorites (reuses `scanRepository`)
