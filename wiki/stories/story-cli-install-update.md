---
id: story-cli-install-update
title: CLI — Reinstall/Update an Already-Tracked Skill
status: planned
domain: cli
created: 2026-07-10
updated: 2026-07-10
---

# Story: CLI — Reinstall/Update an Already-Tracked Skill

## User story

As a developer re-running `npx skillstack add` against a repository I've already
installed from, I want the CLI to tell me whether the owner has updated it since, and
let me choose which version to install if it was previously validated, so that I don't
silently overwrite a validated skill with unreviewed changes.

## Workflow

This story reuses the full discovery/select/install/telemetry pipeline from
story-cli-install-new and its backend registry lookup — the only new behavior is what
happens once the lookup returns a known repo. The CLI compares the repository's latest
commit hash to the one stored in Firestore. If unchanged, it installs using the stored
info as-is. If changed and the stored version was never validated, it installs the
latest version the same way a first-time install would. If changed and the stored
version was already validated, the CLI presents a choice: install the validated stored
version, or the newer unvalidated latest version. Either way, a successful install
triggers the same telemetry call as story-cli-install-new.

## Tasks

| Task   | Module | Status | Description                                     |
| ------ | ------ | ------ | -------------------------------------------------- |
| SS-322 | cli    | draft  | Commit-hash update detection                       |
| SS-323 | cli    | draft  | Version choice prompt for validated repos with changes |

## E2E test scenarios

### E2E-1: Golden path — unchanged repo reinstalls from stored info

**Given** a repository already tracked in Firestore whose latest GitHub commit matches
the stored commit hash
**When** the user re-runs `npx skillstack add <repo-url>`
**Then** the CLI installs using the stored commit hash and validation statuses without
re-fetching or re-warning
**And** telemetry still records the new installation.

### E2E-2: Critical negative — validated version changed, user picks wrong choice path handled

**Given** a repository whose stored version is `approved` but the latest commit differs
**When** the user is prompted and explicitly chooses the newer (unvalidated) version
**Then** the CLI installs the newer version but clearly marks it as unvalidated in its
output, and telemetry marks it as awaiting a new validation pass
**And** the previously-approved stored version's status is not silently carried over to
the new commit.

### E2E-3: Permission/edge boundary — unvalidated stored version with a new commit

**Given** a repository whose stored version was never validated and the latest commit
differs from the stored hash
**When** the user re-runs the add command
**Then** the CLI installs the latest version directly (same as a first-time install),
without presenting a version-choice prompt, since there is no validated version to
protect
**And** the stored commit hash is updated to the latest after install.

## Dependencies

- Depends on: story-cli-install-new
- Used by: (none)
