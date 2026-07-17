---
description: Error handling and logging — English messages, actionable errors, correct log levels, no secrets
globs: "**/*.{ts,tsx,js,jsx,mjs,cjs}"
alwaysApply: true
---

# Error handling and logging

Messages surfaced to developers — in thrown errors and in logs — must be written
in English. This keeps stack traces, console output, and log aggregation
readable for every contributor.

## Errors

### Rule 1 — Throw `Error`, never strings

Throw an `Error` (or a subclass), never a string or plain object — only `Error`
carries a stack trace.

```ts
// ❌ BAD
throw `not found`;
throw { code: 404 };

// ✅ GOOD
throw new Error('Repository tree not found');
```

### Rule 2 — Actionable and specific

State what failed and include the relevant context (identifier, value, status) so
the message is diagnosable on its own. Avoid bare "Error" / "Something went wrong".

```ts
// ❌ BAD — no context
throw new Error('request failed');

// ✅ GOOD — subject + context
throw new Error(`GitHub API ${response.status} for ${owner}/${repo}`);
```

### Rule 3 — Preserve the original cause when wrapping

When catching and rethrowing, attach the original error via the `cause` option
instead of discarding it or flattening it into a string.

```ts
// ❌ BAD — original stack lost
catch (error) {
  throw new Error('Failed to fetch blob');
}

// ✅ GOOD
catch (error) {
  throw new Error(`Failed to fetch blob ${sha}`, { cause: error });
}
```

### Rule 4 — Never swallow errors

No empty `catch`. Either handle it, rethrow it (optionally wrapped), or log it
with context — silent failures hide bugs.

```ts
// ❌ BAD
try { await pull(options); } catch {}

// ✅ GOOD
try {
  await pull(options);
} catch (error) {
  console.error(`Pull failed for ${options.repoUrl}:`, error);
  throw error;
}
```

## Logging

### Rule 5 — Use the right level

Pick the level by intent: `console.error` for failures, `console.warn` for
recoverable or unexpected-but-tolerated conditions, `console.log`/`info` for
normal progress. Do not report errors through `console.log`.

```ts
// ❌ BAD — error reported at log level
console.log('failed to write file');

// ✅ GOOD
console.error(`Failed to write ${target}`);
console.warn(`Directory "${prefix}" is truncated — result may be partial`);
console.log(`Repository: ${owner}/${repo} (ref: ${resolvedRef})`);
```

### Rule 6 — Include context, not just static text

Log the identifiers needed to act on the message (repo, ref, path, count) rather
than a generic sentence.

```ts
// ❌ BAD
console.log('done');

// ✅ GOOD
console.log(`Created ${createdFiles} file(s) and ${createdDirs} dir(s)`);
```

### Rule 7 — Keep volume proportionate

Log meaningful events, not every iteration of a hot loop. Summarize bulk work
with a count instead of one line per item when the per-item detail adds no value.

## Never log or expose secrets

Never put tokens, passwords, keys, or personal data in an error message or log —
they leak into stack traces and log aggregation.

```ts
// ❌ BAD
console.log(`Authorizing with token ${token}`);
throw new Error(`Auth failed for token ${token}`);

// ✅ GOOD
console.log('Authorizing with provided token');
throw new Error('Authentication failed (401)');
```

## Checklist

- Error and log messages are in English.
- Throw `Error` (or a subclass), never a string/object.
- Messages are actionable: subject + context (id, value, status).
- Wrapped errors preserve the original via `{ cause }`.
- No empty `catch`; errors are handled, rethrown, or logged with context.
- Correct level: `error` for failures, `warn` for recoverable, `log` for progress.
- No secrets or personal data in messages.
- Localized UI copy lives in i18n files, not inline literals.
