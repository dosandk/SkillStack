---
description: Error handling
globs: '**/*.{ts,tsx,js,jsx,mjs,cjs}'
alwaysApply: true
---

# Reliability & Error Handling

## General Principles

- Error and log messages are in English.
- Throw `Error` (or a subclass), never a string/object.
- Messages are actionable: subject + context (id, value, status).
- Prefer preventing errors over handling them.
- Wrapped errors preserve the original via `{ cause }`.
- No empty `catch`; errors are handled, rethrown, or logged with context.
- Correct level: `error` for failures, `warn` for recoverable, `log` for progress.
- No secrets or personal data in messages.
- Localized UI copy lives in i18n files, not inline literals.
- Fail fast when the application reaches an invalid state.
- Treat all external systems (API, filesystem, database, network) as unreliable.
- Assume every asynchronous operation may fail.
- Never sacrifice correctness for convenience.

## Catching Errors

- Catch errors only when you can:
  - recover,
  - add meaningful context,
  - translate them into domain errors,
  - perform cleanup,
  - or log them at the appropriate boundary.

- Do not add redundant try/catch blocks that simply rethrow.

Bad

```ts
try {
  return await service();
} catch (error) {
  throw error;
}
```

Good

```ts
return service();
```

## Never Swallow Errors

Never ignore exceptions.

Bad

```ts
catch {}
```

Bad

```ts
catch (error) {
    console.error(error);
}
```

Good

```ts
catch (error) {
    logger.error("Failed to process booking", {
        bookingId,
        error,
    });

    throw error;
}
```

## Add Context

Whenever an error crosses a layer boundary, enrich it with useful context.

Prefer

- booking id
- customer id
- request id
- resource name
- operation name

instead of generic messages.

Bad

```ts
throw error;
```

Good

```ts
throw new Error(`Failed to save booking ${bookingId}`, { cause: error });
```

## Preserve Root Cause

Never lose the original stack trace.

Prefer

```ts
throw new Error(message, {
  cause: error
});
```

over creating unrelated errors.

## Log Once

Errors should be logged exactly once.

Do not log the same exception at every layer.

Preferred logging boundary:

- HTTP controller
- CLI entrypoint
- background worker
- queue consumer

Lower layers should usually throw instead of log.

## Use Domain Errors

Prefer specific error types.

Good

- ValidationError
- UserNotFoundError
- BookingConflictError
- PermissionDeniedError

Avoid generic

```ts
throw new Error(...)
```

for business failures.

## Validate Early

Validate all public inputs immediately.

Examples

- API payload
- CLI arguments
- environment variables
- configuration
- user input

Never rely on downstream failures for validation.

## Fail Fast

Stop execution immediately after detecting invalid state.
Avoid continuing with partially invalid objects.

## Timeouts

Every network operation should have an explicit timeout.
Never wait indefinitely.

## Cleanup

Resources must always be released.

Use

- finally
- AbortController
- disposable resources

when appropriate.

## Promise Handling

Never leave rejected promises unhandled.

Prefer

```ts
await doWork();
```

If fire-and-forget is intentional

```ts
void doWork();
```

## Concurrent Operations

Use

```ts
Promise.all();
```

only when one failure should fail the entire operation.

Use

```ts
Promise.allSettled();
```

when partial success is acceptable.

## User-facing Errors

Internal implementation details must never be exposed to users.

Expose

- clear
- actionable
- human-readable

messages.

Log the technical details separately.

## Error Messages

Error messages should explain

- what failed,
- why it failed,
- and, when possible, how to resolve it.

Avoid vague messages like

- "Error"
- "Failed"
- "Something went wrong"
