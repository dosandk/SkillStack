---
name: run-checks
description: >-
  Commands that verify a SkillStack change per package: focused test files,
  unit suites, type checks, lint, format, and the emulator-backed integration
  and e2e suites. Use when running or verifying tests, types or lint for
  client, shared, functions or cli code.
---

# Run checks

Run from the repo root; the `cd <pkg>; …` form works in PowerShell and bash.

| Package              | Test files                             | Unit suite                       | Type check                       |
| -------------------- | -------------------------------------- | -------------------------------- | -------------------------------- |
| `client/`, `shared/` | `npx vitest run <files>`               | `npm run test:run`               | `npm run typecheck`              |
| `functions/`         | `cd functions; npx vitest run <files>` | `cd functions; npm run test:run` | `cd functions; npx tsc --noEmit` |
| `cli/`               | `cd cli; npx vitest run <files>`       | `cd cli; npm run test:run`       | `cd cli; npx tsc --noEmit`       |

Changed files, any package:

- lint: `npx eslint <files>`, without `--fix`;
- format: `npx prettier --write <files>`, or `npx prettier --check <files>`
  when you must not change files.

Integration and e2e suites build the code, start the emulators and run
serially. Run them only for `full` verification:

- `cd functions; npm run test:integration:ci`
- `npm run test:e2e`

If the emulators cannot start (for example, Java or the Firebase CLI is
missing), record the suite as `not run` with the reason.

## Baseline

Record the results before you change anything and compare afterwards; only
failures you introduced are yours.

- `cd cli; npx tsc --noEmit` already reports errors on the main branch: count
  only errors in files of the change.
- Red tests in `client/` or `shared/` that import modules not written yet also
  fail `npm run typecheck` until that code exists.
