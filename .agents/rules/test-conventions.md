---
description: Test structure — describe wrapper, it blocks, 'should' naming, AAA
globs: "**/*.spec.{ts,tsx}"
alwaysApply: false
---

# Test conventions

Structure every test the same way so specs read as behavior specifications:
`describe` names the unit, each `it` states one expected behavior, and the body
follows Arrange–Act–Assert.

## Rule 1 — exactly one `describe` per file

Every spec has exactly **one** `describe`, and it is the top-level wrapper that
names the unit under test in domain language. Never use nested `describe` blocks
and never place multiple `describe` blocks at the same level — one file, one
`describe`. Group scenarios with clear `it` descriptions instead. No test case
lives outside the `describe`.

```ts
// ❌ BAD — generic label
describe('pull', () => { ... });

// ❌ BAD — multiple describes at the same level
describe('repositoriesStore.list', () => { ... });
describe('repositoriesStore.add', () => { ... });

// ❌ BAD — nested describes
describe('repositoriesStore', () => {
  describe('list', () => { ... });
  describe('add', () => { ... });
});

// ✅ GOOD — one describe, scenarios distinguished by `it` descriptions
describe('repositoriesStore', () => {
  it('should return every document merged with its id when listing', () => { ... });
  it('should write a validated repository and return the document id', () => { ... });
});
```

## Rule 2 — `it` blocks only

Test cases go inside `describe`, one per `it(...)`. 
The bare vitest `test(...)` form outside a `describe` is not allowed.

```ts
// ❌ BAD — bare test(), no describe
test('adds 1 + 2 to equal 3', () => { ... });

// ✅ GOOD
describe('sum', () => {
  it('should add two numbers', () => { ... });
});
```

## Rule 3 — `it` descriptions start with `should`

Each `it` description begins with `should` followed by the expected behavior in
domain terms — not a generic placeholder.

```ts
// ❌ BAD
it('works correct #1', () => { ... });
it('parses owner/repo short form', () => { ... });

// ✅ GOOD
it('should parse owner/repo short form', () => { ... });
it('should throw on an unrecognizable reference', () => { ... });
```

## Rule 4 — Arrange–Act–Assert body

The `it` body follows Arrange–Act–Assert, with one main assertion for the
behavior under test. Split unrelated behaviors into separate `it` blocks.

Express the three phases with **structure** — a blank line between arrange, act,
and assert — **not** with `// Arrange` / `// Act` / `// Assert` label comments.
Those labels narrate *what* the code does, which `code-comments.md` forbids
(comments are `NOTE:`-only, for non-trivial nuance). The example below shows the
labels **only to illustrate the phases**; do not emit them in generated or
committed code — keep the phases separated by blank lines alone.

```ts
// Example only — the // Arrange/Act/Assert labels illustrate the phases.
// In real code, drop the labels and keep just the blank-line separation.
it('should strip a trailing .git suffix', () => {
  // Arrange
  const repoUrl = 'https://github.com/dosandk/SkillStack.git';

  // Act
  const parsed = parseRepo(repoUrl);

  // Assert
  expect(parsed).toEqual({ owner: 'dosandk', repo: 'SkillStack', ref: undefined });
});
```

The same test as it should actually be written — phases as blank lines, no labels:

```ts
it('should strip a trailing .git suffix', () => {
  const repoUrl = 'https://github.com/dosandk/SkillStack.git';

  const parsed = parseRepo(repoUrl);

  expect(parsed).toEqual({ owner: 'dosandk', repo: 'SkillStack', ref: undefined });
});
```

## Rule 5 — Assert the specific error, not a bare `toThrow()`

When testing that code throws, assert *which* error — a message substring, regex,
or error type. A bare `toThrow()` passes on any error (including an unrelated
`TypeError`), so it keeps the test green even when the code fails for the wrong
reason. Match a stable part of the message, not the full string with dynamic bits.

```ts
// ❌ BAD — passes on any thrown error
expect(() => parseRepo('not a repo')).toThrow();

// ✅ GOOD — asserts the intended failure
expect(() => parseRepo('not a repo')).toThrow(
  'Could not parse repository reference'
);
```

## Rule 6 — File placement

Test files are `*.spec.ts` / `*.spec.tsx`, colocated next to the module under
test (`pull.ts` → `pull.spec.ts` in the same folder).

## Rule 7 — Do not test validation schemas

Validation schemas (e.g. Zod object schemas) are not covered by tests. Don't write
cases that assert a schema accepts a valid payload or rejects a missing/wrong-typed
field — that only re-tests the schema library. Test the *behavior* of the function
that consumes the schema instead (what it writes, returns, or calls), using valid
input.

```ts
// ❌ BAD — tests the schema itself
it('should reject a payload missing a required field', () => {
  expect(() => repositorySchema.parse({ author: 'octocat' })).toThrow();
});

// ✅ GOOD — tests the function's behavior on valid input
it('should write a validated repository and return the document id', async () => {
  const id = await writeRepository(validRepo);
  expect(id).toBe('repo-123');
});
```

## Checklist

- Exactly one `describe` per file, naming the unit in domain language — no nested or sibling `describe` blocks.
- Every case is an `it` inside a `describe`; no bare `test(...)`.
- Each `it` description starts with `should ` and states the behavior.
- Body follows Arrange–Act–Assert with one main assertion, phases separated by blank lines — no `// Arrange` / `// Act` / `// Assert` label comments.
- Error assertions check the specific error (message/type), not a bare `toThrow()`.
- No tests for validation schemas — test the consuming function's behavior instead.
- `*.spec.ts(x)` colocated with the module under test.
