---
id: story-foundation-registry-model
title: Platform Foundation & Registry Data Model
status: partial
domain: platform, backend
created: 2026-07-10
updated: 2026-07-10
---

# Story: Platform Foundation & Registry Data Model

## User story

As the SkillStack team, we need a deployed monorepo and a Firestore schema for
repositories/skills, so that every other story has a platform to run on and a data
model to read from and write to.

## Workflow

**Exception to the usual story shape:** this is infrastructure, not a user-facing
workflow — there is no end user action to narrate. The monorepo (client + functions)
is scaffolded and deployed; on top of it, Firestore holds one document per repository
(owner reference, repo reference, commit hash, README-derived description, calculated
validation status, calculated install count, timestamps) with a `skills` subcollection
(name, validation status, install count, timestamps) and security rules restricting
writes to the owner and to trusted functions. No skill files are stored, only the
commit hash. Every Cloud Function in every other story reads/writes through this
schema.

## Tasks

| Task   | Module   | Status | Description                                         |
| ------ | -------- | ------ | ---------------------------------------------------- |
| SS-001 | platform | done   | Monorepo scaffold + TypeScript path aliases          |
| SS-002 | platform | done   | Deploy client and Cloud Functions                    |
| SS-501 | backend  | ready  | Repository document schema                           |
| SS-502 | backend  | ready  | Skills subcollection schema                          |
| SS-503 | backend  | draft  | Calculated repo validation status & install count    |
| SS-504 | backend  | ready  | Firestore security rules for repos & skills          |

## E2E test scenarios

None. This story has no direct user-facing workflow — it is verified entirely by each
task's own unit and integration test requirements (schema validation tests, and
Firestore emulator rules tests for SS-504). Every story below exercises this schema
indirectly through its own E2E scenarios once its Cloud Function tasks are built on
top of it — that is the intended verification path, not the console.

## Dependencies

- Depends on: (none — baseline)
- Used by: story-auth-profile, story-catalog-search, story-upload-repo,
  story-validate-skill, story-cli-install-new, story-cli-install-update
