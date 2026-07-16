---
name: implement-user-story
description: >-
  End-to-end orchestration skill for implementing a SkillStack user story: parses
  story + task files from wiki/, explores impacted system parts in parallel, creates
  an implementation plan for developer approval, implements in the prescribed layer
  order, runs build checks, performs a self-review, generates tests, and waits for
  explicit user acceptance before marking anything done. Use when given a
  wiki/stories/*.md path or story ID (e.g. story-auth-profile).
disable-model-invocation: true
---

# Implement User Story

End-to-end workflow: story file → explore codebase → plan → implement → build checks → code review → tests → user acceptance.

Requires **Agent mode** (subagents and build commands unavailable in Ask/Plan modes).

## Hard rules

- **Never write any code before the plan is approved** (Phase 3 gate).
- **Never proceed to code review until build checks are clean** (Phase 5 gate).
- **Never mark a story or task as done without explicit user confirmation** (Phase 8 gate).
- Delegate all commits to the [git-commit skill](../git-commit/SKILL.md); never invent a commit format.
- All React/UI code must follow the [eleks-ui skill](../eleks-ui/SKILL.md) conventions.
- Every comment added to source code must start with `NOTE:` per the code-comments rule.
- Never auto-close, auto-update, or auto-merge any story or task file.

---

## Phase 1 — Fetch requirements

Read all spec files before touching the codebase.

1. Read `wiki/stories/<story>.md` in full. Extract:
   - `domain:` field (e.g. `frontend, backend`) — drives which subagents launch in Phase 2
   - User story statement, workflow description
   - Tasks table (every SS-XXX row and its `module` column)
   - All E2E test scenarios (used later in Phase 7 and Phase 8)
   - `Dependencies` block

2. For every SS-XXX task ID in the tasks table, read `wiki/tasks/<id>.md`. Extract:
   - Summary
   - Unit test requirements
   - Integration test requirements
   - Quality gates checklist

3. Produce an internal summary listing:
   - Story title and status
   - Active domains: a subset of `{client, functions, cli, shared}`
   - All tasks and their modules
   - All E2E scenarios (numbered)

---

## Phase 2 — Explore existing code (parallel subagents)

Launch one `explore` subagent **per active domain** simultaneously. Wait for all to finish before proceeding.

Determine active domains from Phase 1 (`domain:` field + task `module` columns):

| Domain token    | Module column value | Subagent prompt focus |
| --------------- | ------------------- | ----------------------|
| `backend`       | `backend`           | See Backend targets   |
| `frontend`      | `frontend`          | See Frontend targets  |
| `cli`           | `cli`               | See CLI targets       |
| `shared`        | any (always run if story touches more than one layer) | See Shared targets |

### Backend subagent targets

- Firestore collections and document shapes (`functions/`)
- Cloud Function handlers and their structure (HTTP, callable, scheduled)
- Security rules (`firestore.rules`)
- Existing service/helper patterns and error handling conventions
- Test files — mocking approach, module setup, `vi.fn()` vs `jest.fn()` patterns

### Frontend subagent targets

- API client classes and their method signatures (`client/src/`)
- Feature page and panel components for the relevant feature domain
- ELEKS UI component usage — local overrides in `client/src/components/eleks-ui/`
- Zod validation schema patterns (`shared/src/schemas/` and local feature schemas)
- Test files — React Testing Library conventions, fixture patterns, mock setup

### Shared subagent targets

- Zod schemas in `shared/src/schemas/` and inferred TS types
- Which client and backend files import from `@shared`

### CLI subagent targets

- Commander command definitions (`cli/src/commands/`)
- Install/add flow (`cli/src/`)
- `skills-lock.json` format and update conventions
- Test files — mocking approach for file system and HTTP calls

Provide each subagent with the story's workflow description and task summaries as context so exploration is focused on relevant entities.

---

## Phase 3 — Create plan

**Gate: do not write any code or make any edits until the user approves the plan.**

Using the Phase 1 requirements and Phase 2 exploration summaries, call the `CreatePlan` tool with a plan that covers:

- **Files to create** — new schemas, handlers, components, test files (with paths)
- **Files to modify** — existing entities, services, clients, modules, pages (with paths)
- **Approach per layer** — one paragraph per active domain describing the implementation strategy
- **Architectural decisions** — any non-obvious choices (e.g. where business logic lives, how errors surface)
- **Implementation order** — the exact sequence across layers (backend → shared → frontend → CLI)

Present the plan and wait. Do not proceed until the user explicitly approves (e.g. "approved", "looks good", "go ahead").

---

## Phase 4 — Implementation

Follow the approved plan. Use the implementation order below for each active domain.

### Backend (`functions/`)

1. Firestore schema / collection changes (document shape, indexes)
2. Cloud Function handler — find entity, validate state, update Firestore, fire side effects
   - Wrap side effects (email, notifications) in try/catch so failures do not crash the main operation
3. Register any new providers or function exports
4. Update security rules if new collections or access patterns are introduced

Run `cd functions && npm run build` after completing this layer. Fix all errors before starting the next layer.

### Shared (`shared/`)

1. Add or update Zod schemas in `shared/src/schemas/`
2. Export inferred TS types — do not duplicate types already derivable from Zod

### Frontend (`client/`)

1. Consume updated shared types (no re-declaration)
2. Add Zod validation schema for any new form (in the feature folder or `shared/`)
3. Add API client method to the relevant client class
4. Add or update state hook / custom hook
5. Identify ELEKS UI components to use — check local `client/src/components/eleks-ui/` first, then MCP docs
6. Build or update components and icons
7. Wire everything together in the page or panel

Run `npm run typecheck && npm run lint` after completing this layer. Fix all errors before starting the next layer.

### CLI (`cli/`)

1. Add or update the commander command definition
2. Implement install/update logic
3. Update `skills-lock.json` handling if the command modifies it

Run `cd cli && npm run build` after completing this layer. Fix all errors before starting the next layer.

---

## Phase 5 — Build checks

**Gate: all checks must be clean before proceeding to code review.**

Run these commands for every active domain:

```bash
# Always run
npm run typecheck && npm run lint

# If functions/ was touched
cd functions && npm run build && cd ..

# If cli/ was touched
cd cli && npm run build && cd ..
```

If any command fails: fix the errors, re-run the failed command, and repeat until clean. Do not skip to Phase 6 with a dirty build.

---

## Phase 6 — Code review

Self-review all changes against the four-axis checklist below. Fix every **critical** finding before Phase 7. Surface **non-critical** findings to the user as labelled warnings.

### Security

- [ ] All inputs validated (Zod schema or explicit guard) before use
- [ ] No endpoints reachable without the correct auth guard
- [ ] HTML in email/notification templates escaped or sanitised
- [ ] No secrets, tokens, or credentials in source files

### Architecture

- [ ] Business logic lives in service/handler, not in controllers or components
- [ ] Every async operation has error handling; side-effect failures are non-fatal
- [ ] No tight coupling between unrelated modules
- [ ] New code follows existing patterns discovered in Phase 2

### Requirements

- [ ] Every E2E scenario from the story is reachable through the implemented flow
- [ ] Edge cases (not-found, wrong state, unauthenticated) are handled explicitly
- [ ] State transitions are guarded (can't skip states, can't act on wrong status)

### Performance

- [ ] No N+1 Firestore reads (batch or collection-group where possible)
- [ ] Result sets are bounded (pagination or limit applied)
- [ ] Composite indexes added for any multi-field Firestore queries

---

## Phase 7 — Generate tests

Read `.agents/rules/test-conventions.mdc` before writing any test file to pick up file naming, test structure, and tooling conventions.

Derive all specific test cases from:
- E2E scenarios extracted in Phase 1 (for E2E tests)
- Unit/integration test requirements in each `wiki/tasks/<id>.md` (for unit tests)

### Backend unit tests (`functions/`)

- Happy path for each new service/handler method
- State validation failure (wrong status, invalid transition)
- Not-found scenarios (invalid ID, missing document)
- Side-effect failure is non-fatal (email/notification error does not reject the main promise)

### Backend E2E tests

- Success with valid input and authenticated caller
- Validation failure (empty body, oversized field, invalid enum)
- Wrong state transition attempt
- Authentication failure (no token, wrong owner)

### Frontend unit tests (`client/`)

- Component renders in each visual state (loading, error, empty, populated)
- Form validation rejects invalid input and shows error messages
- State hook transitions (pending → fulfilled, pending → rejected)
- Any conditional rendering (gated on auth, status, ownership)

### Frontend E2E tests

- Full user flow from page load through action completion
- Validation error display without page crash
- Success state reflected in UI (status label updated, redirect, etc.)

### CLI unit tests (`cli/`)

- Command parsing (correct args produce correct options object)
- Install/update logic with mocked file system and HTTP
- `skills-lock.json` written correctly on success

---

## Phase 8 — User validation

**Hard gate: do not auto-close or auto-update any story or task file.**

Present a structured acceptance report:

```
## Acceptance report — <story title>

### Implemented
<bullet list of every file created or modified>

### E2E scenario coverage
- E2E-1: <scenario title> — covered by <test file>
- E2E-2: ...
- E2E-3: ...

### Task quality gates
| Task   | Quality gates met |
| ------ | ----------------- |
| SS-XXX | [ ] / [x] per gate |

### Open warnings (non-critical review findings)
<list or "none">
```

Wait for explicit user acceptance (e.g. "accepted", "done", "ship it") before taking any further action.

Only after the user accepts: instruct them to manually update the `status` fields in the story file and each task file. Do not make those edits yourself.

---

## Commit

After user acceptance, follow the [git-commit skill](../git-commit/SKILL.md) end-to-end to stage, draft a Conventional Commit message, validate with commitlint, and commit — only after the user confirms the proposed message.

---

## MCP / tool summary

| Phase | Tool used |
| ----- | --------- |
| 2     | `Task` (subagent_type: `explore`), multiple in parallel |
| 3     | `CreatePlan` |
| 4–5   | `Shell`, `Read`, `Write`, `StrReplace` |
| 6     | inline checklist (no external tool) |
| 7     | `Write`, `Read` (test-conventions rule) |
| 8     | assistant message only — no file edits |

## Example invocation

```text
Use the implement-user-story skill for wiki/stories/story-auth-profile.md
```

Or: "implement user story story-validate-skill".
