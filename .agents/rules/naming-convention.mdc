---
description: Naming for identifiers — no single letters, domain names, case and React conventions
globs: "**/*.{ts,tsx,js,jsx}"
alwaysApply: false
---

# Naming conventions

Applies to variables, parameters, functions, classes, types, and test identifiers.

## Rule 1 — No single-letter names

Identifiers must not be a single character. Use a full word that describes the
value or responsibility — including in inline callbacks.

```ts
// ❌ BAD
element.on('click', e => { ... });

onChange={ e => setSearchQuery(e.target.value)}

const m = cleaned.match(...);

CONTENT_TYPES.map(t => ...)

class M {}

// ✅ GOOD
element.on('click', event => { ... });

onChange={event => setSearchQuery(event.target.value)}

const match = cleaned.match(...);

CONTENT_TYPES.map(contentType => ...)

class RepoNameMatcher {}
```

## Rule 2 — Names reflect the domain

An identifier must convey **what** it represents in its context — not just its
type or operation.

```ts
// ❌ BAD — ambiguous outside local context
const data = '';
const result = '';
class Handler {}

// ✅ GOOD — subject is clear
const skillMetadata = '';
const pullResult = '';
class SkillValidationHandler {}
```

When a short name is obvious from immediate context (e.g. `match` right after
`.match()`), it is acceptable. When the name could mean several things, add the
domain prefix or qualifier (`repoNameMatch`, `pullRequestTitle`, `skillCount`,
`SkillInstallTelemetry`).

## Rule 3 — Case conventions

| Entity | Style | Example |
|--------|-------|---------|
| variables, parameters, functions | camelCase | `searchQuery`, `parseRepo` |
| types, interfaces, classes, components | PascalCase | `PullOptions`, `ContentList` |
| module-level constants | SCREAMING_SNAKE | `GITHUB_API`, `FILE_DEPTH` |
| React prop types | PascalCase + `Props` | `ContentListProps` |
| hooks | `use` + PascalCase | `useContent`, `useAuth` |
| booleans | `is`/`has`/`can`/`should` + PascalCase | `isLoading`, `hasError` |

## Rule 4 — React conventions

- Event handlers: `event`, not `e`.
- `.map()` callbacks: name the element from the domain (`contentType`, `catalogItem`), not `t` or `item` when ambiguous.
- Component files: PascalCase (`ContentList.tsx`).

```tsx
// ❌ BAD
onChange={e => setSearchQuery(e.target.value)}
{CONTENT_TYPES.map(t => <Button key={t} ... />)}

// ✅ GOOD
onChange={event => setSearchQuery(event.target.value)}
{CONTENT_TYPES.map(contentType => <Button key={contentType} ... />)}
```

## Rule 5 — Tests

`describe` / `it` use domain language, not generic placeholders. See
`test-conventions.mdc` for the full test structure (describe wrapper, `should`
prefix, AAA, file placement).

```ts
// ❌ BAD
describe('pull', () => {
  it('should work correct #1', () => { ... });
});

// ✅ GOOD
describe('Repository parsing', () => {
  it('should parse owner/repo short form', () => { ... });
});
```

## Exceptions

Rule 1 does not apply to:

- **Generic type parameters**: `T`, `K`, `V`, `E` (and similar single-letter generics).
- **Intentionally unused bindings**: `_` or `_prefix` (aligned with ESLint `argsIgnorePattern: '^_'`).
- **External API-mandated names**: when a third-party signature requires a specific identifier.

```ts
// ✅ Allowed exceptions
function identity<T>(value: T): T { return value; }
array.filter((_, index) => index > 0);
onChange={(_, sortTab: SortTab) => setTab(sortTab)}
```

Do **not** treat short inline callbacks as an exception — use full names even on one line.

## SkillStack domain examples

| Instead of | Prefer |
|------------|--------|
| `data` | `skillMetadata`, `catalogEntry` |
| `result` | `pullResult`, `validationOutcome` |
| `handler` | `skillValidationHandler` |
| `item` (in content list) | `catalogItem`, `contentEntry` |
| `url` (in parseRepo) | `repoUrl` |
| `q` (search filter) | `query`, `searchQuery` |

## Examples

```ts
// Before
function parseRepo(url: string): ParsedRepo {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (m) return { owner: m[1], repo: m[2] };
  throw new Error(`Invalid: ${url}`);
}

// After
function parseRepo(repoUrl: string): ParsedRepo {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match) return { owner: match[1], repo: match[2] };
  throw new Error(`Invalid: ${repoUrl}`);
}
```

## Checklist

- No single-letter identifiers (except generic `T`/`K`/`V`/`E` and `_` unused bindings).
- Names state the domain subject, not just the type (`skillMetadata`, not `data`).
- camelCase for values/functions; PascalCase for types/components; SCREAMING_SNAKE for module constants.
- React: `event` in handlers; domain names in `.map()`; `Props` suffix on prop interfaces.
- Tests: `*.spec.ts` colocated; `describe`/`it` describe behavior in domain terms.
