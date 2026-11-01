# Implementation: Feature 1 — Repository detail page

| Field      | Value                                                         |
| ---------- | ------------------------------------------------------------- |
| Issue      | [#1](https://github.com/khomyakoleksandr/SkillStack/issues/1) |
| Status     | Green                                                         |
| Revision   | 2                                                             |
| Built from | spec r2, plan r3, tests r2                                    |

## Summary

All nine tasks are done. The new `apiGetRepositoryDetails` endpoint, the `backendService` / `githubService` additions, the install-command and description helpers, the routed client with the repository page and the linked catalog rows are in place. Revision 2 reworks T-4..T-6 for review R-1: the install command is built only from an allowlisted slug and skill name (otherwise `null`), the GitHub gateway rejects an unsafe slug before any request, and the copy button shows a refusal message instead of copying. Every unit test case is green (TC-1..TC-15, TC-20..TC-104); the integration and e2e suites were not run (`Verification: unit`). R-2..R-7 are out of scope by human direction.

## Tasks

| Task | Status | Test cases                          | Commit      |
| ---- | ------ | ----------------------------------- | ----------- |
| T-1  | done   | TC-1..TC-3 green                    | uncommitted |
| T-2  | done   | TC-4..TC-15 green; TC-16..TC-19 not run | uncommitted |
| T-3  | done   | TC-20..TC-24 green                  | uncommitted |
| T-4  | done   | TC-25..TC-33, TC-94..TC-98 green    | uncommitted |
| T-5  | done   | TC-34..TC-44, TC-99..TC-100 green   | uncommitted |
| T-6  | done   | TC-45..TC-55, TC-101..TC-104 green  | uncommitted |
| T-7  | done   | TC-56..TC-80 green                  | uncommitted |
| T-8  | done   | TC-81..TC-88 green                  | uncommitted |
| T-9  | done   | TC-89..TC-93 not run (e2e, `Verification: unit`); support code and `githubServiceMock.getSkillDescriptions` in place; eslint clean | uncommitted |

## Changed files

| File | Change | Tasks |
| ---- | ------ | ----- |
| `functions/src/services/repositories-store.ts` | `skillDocumentSchema`, `listSkills` | T-1 |
| `functions/src/functions/get-repository-details/function.ts` | **new**: `getRepositoryDetails` domain function (union, unique, sorted) | T-2 |
| `functions/src/functions/get-repository-details/index.ts` | **new**: `apiGetRepositoryDetails` handler (200/400/404/500) | T-2 |
| `functions/src/index.ts` | export `apiGetRepositoryDetails` | T-2 |
| `shared/firebase-cloude-api/index.ts` | `RepositorySkill`, `GetRepositoryDetailsResponse`, `getRepositoryDetails` | T-3 |
| `shared/index.ts` | export `BackendApiError`, `buildInstallCommand`, the new types | T-3, T-4 |
| `shared/utils/safe-names.ts` | **new** (r2): `isSafeRepoSlug`, `isSafeSkillName` | T-4 |
| `shared/utils/build-install-command.ts` | **new**: `buildInstallCommand`; returns `null` for names outside the allowlist, no quoting (r2) | T-4 |
| `shared/utils/parse-skill-description.ts` | **new**: `parseSkillDescription` | T-4 |
| `shared/utils/index.ts` | export both helpers and both predicates | T-4 |
| `shared/github-api/get-skill-descriptions.ts` | **new**: `getSkillDescriptions`; slug guard first, rejects `Unsafe repository slug` (r2) | T-5 |
| `shared/github-api/index.ts` | add the method to `GithubService` | T-5 |
| `shared/github-api/mock/index.ts` | `getSkillDescriptions` mock (`Description of <name>`) | T-5 |
| `client/src/components/RepositoryDetails/SkillList.tsx` | **new**: skill rows, copy button, feedback `Snackbar`; `refused` feedback without clipboard access when the command is `null` (r2) | T-6 |
| `client/src/lib/api.ts` | `fetchRepositoryDetails`, `fetchSkillDescriptions` | T-7 |
| `client/src/hooks/useRepositoryDetails.ts` | **new**: two-phase loading (details, then descriptions) | T-7 |
| `client/src/components/RepositoryDetails/RepositoryDetails.tsx` | **new**: page with back link, header and states | T-7 |
| `client/src/hooks/useRouterLinkProps.ts` | **new**: real `href` link with client-side navigation (DV-1) | T-7, T-8 |
| `client/src/main.tsx` | `BrowserRouter` | T-8 |
| `client/src/App.tsx` | `Routes`: `/`, `/repositories/:id`, `*` → `/` | T-8 |
| `client/src/components/RepositoryList/RepositoryList.tsx` | rows wrapped in a `ListItemButton` link | T-8 |

## Deviations

- **DV-1** (T-7, T-8, D-8): the back link and the catalog rows use `href` plus a client-side `navigate` on a plain left click, through the new `client/src/hooks/useRouterLinkProps.ts`, instead of react-router's `component={RouterLink} to=…`. Why: the ELEKS `Link` and `ListItemButton` prop types reject `to` (the fallback named in plan T-8 step 3, and the Router typing risk); a shared hook avoids duplicating the click logic. The rows keep `repository-item` and `disablePadding` on the `ListItem`, with `pr: 14` on the button so the chip does not overlap the text.
- **DV-2** (T-5, D-5): `get-skill-descriptions.ts` declares its own tree and blob types instead of importing the ones in `get-skills-list.ts`. Why: the tree entry needs `sha`, which the existing type lacks, and `get-skills-list.ts` was not in the task's files.

## Verification

Revision 2 (plan r3, tests r2):

- Baseline: `git status --porcelain` kept; 16 tests red as listed in `tests.md` Baseline r2.
- `npx vitest run` (root): 11 files, 158 tests passed. `cd functions; npx vitest run`: 2 files, 31 tests passed (not affected by r2).
- `npm run typecheck`: no errors. `npx eslint` and `prettier` clean on the 5 changed files.
- No test, fixture or config changed; integration and e2e not run (`Verification: unit`).

Revision 1:

- Baseline: matched `tests.md` (root: 16 passed, 19 failed tests, 5 files failing to load; functions: `repositories-store.spec.ts` TC-1..TC-3 red, `function.spec.ts` red).
- `npm run test:run` (root): 10 files, 91 tests passed (TC-20..TC-88 and the existing `get-repo-slug.spec.ts`).
- `cd functions; npm run test:run`: 2 files, 31 tests passed (TC-1..TC-15 and the 12 existing store tests). `cd functions; npx tsc --noEmit`: no errors.
- `npm run typecheck`: no errors.
- `cd cli; npx tsc --noEmit`: errors only in files this change did not touch (`config.ts`, `get-repo-files.ts`, and the `import.meta.env` line in `github-api/index.ts`, which was there before); none in the new `shared` files.
- ESLint is clean on all changed and new files, except pre-existing errors in lines I did not touch: `sonarjs/todo-tag` in `repositories-store.ts` and `shared/github-api/index.ts`, and the `get-repo-slug.spec.ts` rules. `prettier --check` is clean except the untouched `shared/github-api/get-repo-files.ts`. (Prettier rewrote that file once by accident; I reverted it.)
- Integration (`get-repository-details.i.spec.ts`, TC-16..TC-19) and e2e (`repository-details.e2e.ts`, TC-89..TC-93): not run, `Verification: unit`.
- Not verified: NFR-1 / AC-13 timing, NFR-2 / AC-14 visual consistency (review), BR-7 "works as is" until a `skillstack-cli` with `add` is published (PG-5).

## Gaps

## Feedback

- **R-1** (review): fixed in `shared/utils/safe-names.ts`, `shared/utils/build-install-command.ts`, `shared/github-api/get-skill-descriptions.ts` and `client/src/components/RepositoryDetails/SkillList.tsx`; allowlist instead of quoting, slug guard before GitHub paths, refusal `Alert` without a command.
- **R-2..R-7**: not acted on, out of scope by human direction.
