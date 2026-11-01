# Review: Feature 1 — Repository detail page

| Field      | Value                                                         |
| ---------- | ------------------------------------------------------------- |
| Issue      | [#1](https://github.com/khomyakoleksandr/SkillStack/issues/1) |
| Status     | Approve                                                       |
| Revision   | 2                                                             |
| Built from | spec r2, plan r3, tests r2, implementation r2                 |
| Base       | `9dcf089`                                                     |

## Summary

The change adds `apiGetRepositoryDetails` (Handler → Domain → Store), exposes
it through `backendService`, loads `SKILL.md` descriptions best effort through
`githubService.getSkillDescriptions`, and gives the client a routed
`/repositories/:id` page with loading, empty, error and not-found states and
a "Copy install command" button per skill. Revision 2 fixes the r1 blocker R-1.
The command is now built only from a slug and a skill name that match a
shell-literal allowlist (`shared/utils/safe-names.ts`). Otherwise the button
copies nothing and shows a refusal message. The GitHub gateway also refuses an
unsafe slug before it builds any API path. Every unit case is green, the type
checks pass, and lint and format are clean apart from errors that already
exist at base. R-2..R-7 stay open as minors and a suggestion, by human
direction. The fix adds one new minor (R-8): the spec has no rule yet for a
refused command. The verdict is approve.

## Strengths

- `shared/utils/safe-names.ts:1-23` puts both allowlists in one pure module
  with anchored patterns and no flags. It rejects `.` and `..` as the repo
  name, and refuses a leading `-`, `.` or `_` in a skill name, so a name
  cannot be read as a CLI option. `build-install-command.ts:13-15` and
  `get-skill-descriptions.ts:55-57` both use these predicates, so the
  command and the API path follow the same rule (D-7, D-11).
- `client/src/components/RepositoryDetails/SkillList.tsx:56-64` checks the
  `null` explicitly, which matters because `strictNullChecks` is off. The
  refusal never touches the clipboard and reuses the page-level `Snackbar`
  as a third `CopyFeedback` variant (`SkillList.tsx:30-50`), so the
  one-message-at-a-time behavior (C-15) also holds for refusals.
- The new tests catch the plausible regressions. TC-95 and TC-97 include a
  trailing newline (which an `m` flag would let through), and the injection
  payloads would pass an unanchored pattern. TC-100 pins the guard order.
  TC-101 and TC-102 assert that `writeText` is never called and that the
  page has no `npx skillstack-cli` and no `https://github.com/` text. TC-104
  shows that one refused skill does not block the others.
- The fix is scoped: only the five files that plan r3 names changed. No
  test changed after `tests.md` r2, and no functions, CLI, protected or
  lockfile change was made. The r1 strengths (union and sort in the domain,
  descriptions independent of `status`, real `href`s through
  `useRouterLinkProps`, clean ADR layering) all still hold.

## Findings

### R-2 (minor, code): A bad skill document shows "not found" instead of the error state

- **Refs:** FR-5, AC-7, D-9, T-2, C-3
- **Location:** `functions/src/functions/get-repository-details/index.ts:23-27`,
  `functions/src/services/repositories-store.ts:95`
- **Evidence:** Unchanged since r1. `listSkills` runs
  `skillDocumentSchema.parse` on every skill doc, so a doc with
  `installCount` set to `-1`, `"5"`, `1.5` or `null` throws a `ZodError`
  inside `getRepositoryDetails`. The handler maps every `ZodError` to 400
  `Invalid repository id` without calling `logError`. The client then maps
  400 to `null`, and the page shows "This repository does not exist."
  instead of the FR-5 error state. Today's write paths store only valid
  integers. No unit test covers the handler's status mapping. Not acted on,
  by human direction.
- **Fix:** Separate id validation from the parse of persisted data, so that
  only a bad id maps to 400 and every other error goes to 500 with
  `logError`. Add a handler spec that asserts 200, 400, 404 and 500.

### R-3 (minor, spec): Spec does not record that the command needs a CLI release with `add`

- **Refs:** BR-7, AC-4, PG-5, A-5
- **Location:** `wiki/issues/1-feature-1/spec.md` (Constraints),
  `cli/package.json:3`
- **Evidence:** Unchanged since r1. `cli/package.json` is still `0.0.2`, and
  `add` arrived after that publish (`3ed3c68`). PG-5 is still open against
  spec r2. Unverified: the plan says npm holds only `0.0.1` and `0.0.2`, and
  `npm view skillstack-cli versions` would confirm it. Not acted on, by human
  direction.
- **Fix:** Add the release dependency to the spec, with an owner: a
  `skillstack-cli` version with `add`, built against the production backend,
  ships before or with this page.

### R-4 (minor, code): Skill rows reserve a fixed 320 px on the right

- **Refs:** NFR-2, AC-14, D-10, T-6
- **Location:** `client/src/components/RepositoryDetails/SkillList.tsx:94`
- **Evidence:** Unverified, and unchanged since r1 (the line moved from 72 to
  94). `sx={{ pr: 40 }}` applies at every breakpoint, but the absolutely
  positioned chip and button need that space only on wide screens. At 375 px
  the text column would be very narrow or covered. Rendering the page at
  375 px would confirm it. Not acted on, by human direction.
- **Fix:** Use responsive padding, for example `pr: { xs: 2, sm: 40 }`, and
  let the actions wrap below the text on `xs`.

### R-5 (minor, plan): Plan still lists the wrong spec file and leaves TG-1..TG-3 open

- **Refs:** T-5, T-6, T-7, TG-1, TG-2, TG-3
- **Location:** `wiki/issues/1-feature-1/plan.md` (T-7 **Files**, step 4 and
  **Done when**; Test plan rows for `client/src/lib/api.spec.ts`)
- **Evidence:** Plan r3 still names `client/src/lib/api.spec.ts`, which the
  client runner never picks up. The real file is
  `client/src/lib/api.spec.tsx`. The plan's **Feedback** says it kept this
  on purpose under the human direction. C-13..C-15 still match the spec and
  the code.
- **Fix:** Update T-5, T-6, T-7 and the Test plan to match C-13..C-15, and
  move TG-1..TG-3 to Resolved.

### R-6 (minor, code): Small duplication in the new code

- **Refs:** T-5, T-6, DV-2
- **Location:** `shared/github-api/get-skill-descriptions.ts:26-31`,
  `client/src/components/RepositoryDetails/SkillList.tsx:19-23`
- **Evidence:** Unchanged since r1. `toManifestDir` repeats `toSkillName`
  from `shared/github-api/get-skills-list.ts:38-47`. `SkillList`'s local
  `Skill` interface duplicates `SkillWithDescription` from
  `client/src/hooks/useRepositoryDetails.ts:13`. Not acted on, by human
  direction.
- **Fix:** Share one manifest-path helper in `shared/github-api`, or extend
  DV-2. Type the `SkillList` prop with `SkillWithDescription`.

### R-7 (suggestion): The browser now calls GitHub through a logging, token-aware client

- **Refs:** BR-8, D-4
- **Location:** `shared/github-api/request.ts:34`, `vite.config.ts:34-36`
  (both unchanged)
- **Evidence:** Unchanged since r1, except that D-11 now keeps unsafe slugs
  out of the logged URL. Every page view makes 1 + N GitHub requests, and
  each one logs `🌐 Fetching GET …` to the user's console. `vite.config.ts`
  inlines `process.env.GITHUB_TOKEN` into the client bundle whenever a build
  runs with that variable set.
- **Fix:** Drop or gate the debug log. Stop defining `GITHUB_TOKEN` for the
  client build.

### R-8 (minor, spec; from fix of R-1): Spec has no rule for a skill whose command is refused

- **Refs:** FR-4, BR-5, BR-7, AC-4, A-6, PG-6, D-7, C-18, TC-101..TC-104
- **Location:** `wiki/issues/1-feature-1/spec.md` (FR-4, BR-7, Business rules
  and edge cases); `wiki/issues/1-feature-1/plan.md` (A-6, PG-6, Risks
  "Refused install commands")
- **Evidence:** FR-4 says every skill's button puts the install command on
  the clipboard. Under A-6, the button copies nothing when the stored slug or
  skill name is outside the allowlist (`SkillList.tsx:56-64`). Real users can
  produce such values. Owners with `_` (Enterprise Managed Users) are
  refused. The CLI also stores `--skill` values exactly as typed
  (`cli/src/commands/add/index.ts:14-18`), so a name with a space, a
  non-ASCII letter, or a leading `.`, `_` or `-` gets refused too. The spec
  has no business rule or acceptance criterion for this case. The plan
  raised it as PG-6 (non-blocking) and covered it with A-6. A-6 is the safe
  choice and reuses the BR-5 feedback pattern, so the code is not wrong. But
  the refusal behavior and the allowlist are confirmed only by the plan.
- **Fix:** Resolve PG-6 in the spec. Add a business rule and an acceptance
  criterion saying that the copied command contains only characters that
  stay literal unquoted in bash, zsh, PowerShell and cmd, and that for any
  other stored name the button copies nothing and says so without showing
  the command. State whether owners with `_` must be supported.

## Traceability

| Requirement | Tasks | Test cases | Code | Verdict |
| ----------- | ----- | ---------- | ---- | ------- |
| FR-1 | T-8 | TC-81, TC-85, TC-86, TC-88, TC-89 | `client/src/components/RepositoryList/RepositoryList.tsx:77-82`, `client/src/App.tsx:10-27`, `client/src/main.tsx:13-15` | met |
| FR-2 | T-2, T-5, T-6, T-7 | TC-4, TC-9..TC-11, TC-34..TC-41, TC-45, TC-71, TC-90 | `functions/src/functions/get-repository-details/function.ts:35-48`, `shared/github-api/get-skill-descriptions.ts:50-100`, `client/src/components/RepositoryDetails/SkillList.tsx:89-121` | met |
| FR-3 | T-2, T-7 | TC-5, TC-6, TC-16, TC-46, TC-73, TC-90 | `functions/src/functions/get-repository-details/function.ts:50-53` | met |
| FR-4 | T-4, T-6 | TC-25..TC-29, TC-50..TC-52, TC-98, TC-101..TC-104, TC-91 | `shared/utils/build-install-command.ts:9-20`, `shared/utils/safe-names.ts:8-23`, `client/src/components/RepositoryDetails/SkillList.tsx:56-79` | met (allowlisted names; refusal for others per A-6: R-8) |
| FR-5 | T-7 | TC-12, TC-23, TC-24, TC-59, TC-60, TC-66, TC-76..TC-78 | `client/src/components/RepositoryDetails/RepositoryDetails.tsx:38-81`, `client/src/hooks/useRepositoryDetails.ts:45-72` | met (corrupt-data edge: R-2) |
| FR-6 | T-7 | TC-68..TC-70, TC-89 | `client/src/components/RepositoryDetails/RepositoryDetails.tsx:29-37,66-72` | met |
| FR-7 | T-1, T-2, T-3 | TC-1..TC-4, TC-15, TC-16, TC-19, TC-20, TC-56 | `functions/src/services/repositories-store.ts:90-97`, `functions/src/functions/get-repository-details/index.ts:9-35`, `functions/src/index.ts:13`, `shared/firebase-cloude-api/index.ts:103-109` | met |
| NFR-1 | T-7, T-9 | TC-72, TC-93 (e2e, reviewed statically) | `client/src/hooks/useRepositoryDetails.ts:60-66`, `functions/src/functions/get-repository-details/function.ts:26-29` | met (timing proven only by TC-93, not run) |
| NFR-2 | T-6, T-7 | — (review) | `client/src/components/RepositoryDetails/RepositoryDetails.tsx`, `SkillList.tsx` | not automated: same `Container`, `Heading`, `List`, outlined primary `Chip` and `Stack py: 6` states as the catalog; the refusal uses the same `Snackbar` + `Alert`; narrow widths: R-4 |
| BR-1 | T-4..T-7 | TC-33, TC-39, TC-40, TC-47, TC-74, TC-75 | `client/src/components/RepositoryDetails/SkillList.tsx:115-118`, `shared/utils/parse-skill-description.ts` | met |
| BR-2 | T-1, T-2, T-6 | TC-2, TC-7, TC-8, TC-48 | `functions/src/services/repositories-store.ts:16-18`, `functions/src/functions/get-repository-details/function.ts:39-43` | met |
| BR-3 | T-2 | TC-6 | `functions/src/functions/get-repository-details/function.ts:50-53` | met |
| BR-4 | T-2, T-3, T-7 | TC-13, TC-14, TC-17, TC-18, TC-21, TC-22, TC-57, TC-58, TC-79, TC-80, TC-92 | `functions/src/functions/get-repository-details/index.ts:15-27`, `client/src/lib/api.ts:18-34`, `RepositoryDetails.tsx:47-55` | met |
| BR-5 | T-6 | TC-51, TC-53..TC-55, TC-101, TC-102 | `client/src/components/RepositoryDetails/SkillList.tsx:41-50,56-79,122-136` | met |
| BR-6 | T-8 | TC-87 | `client/src/App.tsx:10-27` | met |
| BR-7 | T-4, T-6, T-9 | TC-25..TC-29, TC-94..TC-98, TC-51, TC-101, TC-102, TC-104, TC-91 | `shared/utils/build-install-command.ts:1-20`, `shared/utils/safe-names.ts:1-23` | met in code: exact name, the GitHub URL `parseRepoPath` accepts, and only shell-literal characters. "Works as is" needs a CLI release with `add` (R-3); refused names: R-8 |
| BR-8 | T-5, T-7 | TC-41, TC-44, TC-62..TC-65, TC-72, TC-74, TC-99, TC-100 | `client/src/lib/api.ts:37-54`, `client/src/hooks/useRepositoryDetails.ts:62-66`, `shared/github-api/get-skill-descriptions.ts:55-57` | met |
| AC-1 | T-8, T-9 | TC-81, TC-85, TC-89 | as FR-1 | met |
| AC-2 | T-2, T-5..T-7 | TC-4, TC-16, TC-34, TC-45, TC-71, TC-90 | as FR-2 | met |
| AC-3 | T-2, T-7 | TC-5, TC-6, TC-16, TC-73, TC-90 | as FR-3 | met |
| AC-4 | T-4, T-6, T-9 | TC-25, TC-26, TC-51, TC-52, TC-91, TC-101, TC-102 | as FR-4 | met (refused names: R-8) |
| AC-5 | T-7 | TC-66 | `RepositoryDetails.tsx:38-46` | met |
| AC-6 | T-2, T-7 | TC-12, TC-76 | `RepositoryDetails.tsx:73-77` | met |
| AC-7 | T-7, T-8 | TC-59, TC-77, TC-78, TC-87 | `RepositoryDetails.tsx:56-64`, `client/src/lib/api.ts:31-33` | met |
| AC-8 | T-4..T-7 | TC-33, TC-40, TC-47, TC-74, TC-75 | as BR-1 | met |
| AC-9 | T-1, T-2, T-6 | TC-2, TC-7, TC-8, TC-48 | as BR-2 | met |
| AC-10 | T-2, T-3, T-7 | TC-13, TC-17, TC-21, TC-57, TC-79, TC-92 | as BR-4 | met |
| AC-11 | T-6 | TC-53, TC-54 | `SkillList.tsx:47-48,66-76` | met |
| AC-12 | T-7 | TC-68..TC-70, TC-89 | as FR-6 | met |
| AC-13 | T-9 | TC-93 (e2e, reviewed statically) | as NFR-1 | met (not run here) |
| AC-14 | T-6, T-7 | — (review) | as NFR-2 | not automated (R-4) |
| AC-15 | T-5, T-7 | TC-44, TC-62, TC-63, TC-74 | as BR-8 | met |

Mutation checks for the R-1 rework, each caught by a named test:
`buildInstallCommand` validating only the slug (TC-28) or only the name
(TC-29); an unanchored pattern (the injection cases of TC-95, TC-97); an `m`
flag (the trailing-newline cases); allowing `..` (TC-95); the gateway guard
missing (TC-99) or placed after the empty shortcut (TC-100); `SkillList`
without the `null` branch, which would write `null` and show success (TC-101,
TC-102); a refusal state that sticks to later clicks (TC-104).

## Verification

| Command | Result | Matches implementation.md |
| ------- | ------ | ------------------------- |
| `npm run test:run` | 11 files, 158 tests passed | yes |
| `npx vitest run shared/utils/safe-names.spec.ts shared/utils/build-install-command.spec.ts shared/github-api/get-skill-descriptions.spec.ts client/src/components/RepositoryDetails/SkillList.spec.tsx` | 4 files, 94 tests passed (TC-94..TC-97 with 3 + 25 + 3 + 21 examples, TC-25..TC-29, TC-98, TC-34..TC-44, TC-99, TC-100, TC-45..TC-55, TC-101..TC-104) | yes |
| `cd functions; npm run test:run` | 2 files, 31 tests passed | yes |
| `npm run typecheck` | no errors | yes |
| `cd functions; npx tsc --noEmit` | no errors | yes |
| `cd cli; npx tsc --noEmit` | same errors as at base and in r1, none in changed files (`commander` and Node types missing; `import.meta.env` in `shared/firebase-cloude-api/config.ts` and `shared/github-api/index.ts:25`; `Buffer` in `get-repo-files.ts`) | yes |
| `npx eslint <36 changed and new files>` | 3 errors, all on lines unchanged since `9dcf089`: unused `repoDocDelete` (`repositories-store.spec.ts:14`), and `sonarjs/todo-tag` in `repositories-store.ts:112` and `shared/github-api/index.ts:22` | yes |
| `npx prettier --check <36 changed and new files>` | clean | yes |

All unit cases that `tests.md` r2 calls green are green, including the
`green (already satisfied)` cases TC-82..TC-84, TC-88 and TC-103. The jump
from 91 to 158 tests matches the r2 additions exactly. Only TC-28 and TC-29
changed among the existing cases, as `tests.md` **Changed existing tests**
records. Their old quoting expectations became refusal expectations, which
are stricter, not weaker. Modification times show that every test file
predates `tests.md` r2 and that only the five files planned for R-1 changed
after review r1.

Plan r3 differs from the plan r2 that review r1 was built on, so this round
reviewed the whole change set again. The files that did not change since r1
are identical to what r1 reviewed, and the r1 analysis of them still holds.

Integration and e2e cases reviewed statically: TC-16..TC-19 and TC-89..TC-93,
unchanged since r1. The e2e fixtures (`dosandk/SkillStack`,
`eleks/awesome-skills`, and the skill names `git-commit`, `code-review`,
`eleks-ui`, `dataviz`, `deep-research`) all pass the allowlist, so TC-91
still expects the copied command and not a refusal.

## Notes

- The change set matches the artifacts: no production file is unaccounted
  for, and no protected file, dependency or lockfile changed. The only other
  untracked files are this issue's artifacts in `wiki/issues/1-feature-1/`.
- R-2..R-7 were not acted on in this round, by the human direction at the
  review r1 gate. They are all minor or suggestion and do not block.
- Rollout: deploy `functions/` first so `apiGetRepositoryDetails` exists
  before hosting deploys on merge. Publish a `skillstack-cli` with `add`
  (plan Rollout step 3, PG-5, R-3) before the copy button can produce a
  working command.
- `apiStoreRepoInfo` and `apiTrackSkillsInstall` still accept any slug and
  skill name (plan Risks). After R-1, such values appear on the page only as
  plain text and can no longer reach a shell or a GitHub path. Tightening
  `repositorySchema` is defense in depth for a separate issue.

## Resolved

- **R-1**: fixed in plan r3 (D-7 allowlist, D-11, A-6), tests r2 (TC-28, TC-29
  and TC-94..TC-104) and implementation r2 (`shared/utils/safe-names.ts`,
  `build-install-command.ts`, `get-skill-descriptions.ts`, `SkillList.tsx`).
  The copied command contains only characters that stay literal in every
  common shell, and unsafe input is refused without showing a command
  (review r2).
