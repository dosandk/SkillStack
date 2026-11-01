---
name: testing-conventions
description: >-
  SkillStack test conventions: which runner picks up which file, test levels,
  mocking boundaries, and the patterns for unit, integration and e2e specs.
  Use when writing, changing or reviewing tests in client, shared, functions,
  cli or e2e.
---

# Testing conventions

## Runners

| Config                                     | Picks up                        | Notes                                                                                               |
| ------------------------------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------- |
| root `vitest.config.ts`, project `shared`  | `shared/**/*.spec.ts`           | node                                                                                                |
| root `vitest.config.ts`, project `client`  | `client/src/**/*.spec.tsx` only | jsdom, setup `client/src/test/setup.ts`; a client test of a non-component module still ends in `.spec.tsx` |
| `functions/vitest.config.js`               | `functions/src/**/*.spec.ts`    | excludes `*.i.spec.ts`                                                                              |
| `functions/vitest.integration.config.js`   | `functions/src/**/*.i.spec.ts`  | serial, needs the emulators                                                                         |
| `cli/vitest.config.ts`                     | `cli/src/**/*.spec.ts`          | `@shared` alias                                                                                     |
| `playwright.config.ts`                     | `e2e/**/*.e2e.ts`               | serial, Vite dev server, emulators                                                                  |

## Levels

Pick the cheapest level that proves the behavior, and do not repeat the same
assertion at several levels.

| Level       | Use for                                                                  | Location                                                       |
| ----------- | ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Unit        | pure logic, domain and store layers, services, components, CLI commands | next to the source                                             |
| Integration | an `apiXxx` endpoint end to end against the Firestore emulator           | `functions/src/integration-specs/<endpoint-kebab>.i.spec.ts`   |
| E2E         | a user journey in the web app                                            | `e2e/<feature-kebab>.e2e.ts`, helpers in `e2e/support/`        |

Do not test Zod schemas on their own (ADR-006): test the function that
consumes the schema.

## Rules

- Test the public contract: exported functions, endpoint responses, rendered
  UI, CLI output and written files. Assert internals only when other code
  depends on them, such as Firestore documents another package reads.
- Mock only at boundaries: `firebase-admin/firestore`, the `@shared` services
  (`githubService`, `backendService`), `fetch`, the file system, `console`,
  time. Never call real GitHub or a real Firebase project.
- One behavior per test, with an assertion a wrong implementation would fail.
  No `it.skip`, `it.only`, `it.todo`, `it.fails`, empty bodies or
  `expect(true)`.
- Deterministic: fake timers, fixed fixtures, no randomness, no dependence on
  test order; clear mocks in `beforeEach`.
- Never delete or weaken an existing test to make a change pass.
- Shared fixtures go in `e2e/support/fixtures.ts`, `e2e/support/firestore.ts`
  or next to the test; add a helper only when two or more tests need it.

## Style

- Import `describe`, `it`, `expect`, `vi` and hooks explicitly from `vitest`
  (`test` and `expect` from `@playwright/test` in e2e). Import groups:
  external packages, then aliases (`@shared`, `@eleks-ui/*`), then relative,
  separated by blank lines.
- `describe` names the unit under test (`repositoriesStore`,
  `apiTrackSkillsInstall`, `RepositoryList e2e`); test names start with
  `should …` and describe behavior, not code.
- Arrange, act and assert, separated by blank lines.

## Patterns

Copy the closest existing test:

- **Unit, functions** (`functions/src/services/repositories-store.spec.ts`):
  hoist mock functions with `vi.hoisted`, then
  `vi.mock('firebase-admin/firestore', …)` before importing the module under
  test.
- **Unit, shared** (`shared/utils/get-repo-slug.spec.ts`).
- **Unit, client**: React Testing Library with jest-dom matchers, loaded by
  the setup file. Query by role, label or text; use `data-testid` only when it
  is part of the contract. Mock `backendService` and `githubService` from
  `@shared`.
- **Unit, CLI** (`cli/src/commands/add/index.spec.ts`): mock the `@shared`
  services and the file system, spy on `console.log`, and assert the files
  written under `.agents/` and the printed output.
- **Integration** (`functions/src/integration-specs/*.i.spec.ts`): call
  `` fetch(`${BASE_URL}/apiXxx`) `` with `BASE_URL` from `./config`; seed and
  read Firestore through `db` from `./setup`; `beforeEach(clearFirestore)` and
  `afterAll(() => admin.app().delete())`. Assert the status code, the body and
  the resulting Firestore state, including both copies of a skill when skills
  change.
- **E2E** (`e2e/repository-list.e2e.ts`): reset and seed with
  `clearRepositories` and `seedRepositories` from `e2e/support/firestore.ts`;
  open pages with `waitUntil: 'domcontentloaded'`, never `networkidle`; wait
  for and select elements by `data-testid`.
