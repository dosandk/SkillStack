# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a single-repo, multi-package project (not npm workspaces — each package has its own
`package.json` / `node_modules` and is installed independently).
TypeScript path aliases and base compiler options are centralized in `tsconfig.base.json`.

- **`client/`** — React 19 + Vite front-end. Uses the vendored ELEKS UI component library (MUI-based). Firebase web SDK client in `client/src/lib/firebase.ts`. Root-level `package.json`, `vite.config.ts`, and `tsconfig.client.json` build this; Vite `root` is `client/`, output goes to `dist/`.
- **`functions/`** — Firebase Cloud Functions (own `package.json`, `firebase-admin`, `firebase-functions`). The backend API.
- **`cli/`** — `skillstack-cli`, a Commander-based CLI (own `package.json`, built with `tsup`). Commands: `push`, `pull`.
- **`shared/`** — intended home for shared Zod schemas (currently empty; schemas presently live inside `functions/`).
- **`wiki/`** — planning docs (stories, tasks, templates); not code.

### ELEKS UI (client components)

Import UI components only via the aliases, never by relative path:

```tsx
import { Button, Avatar } from '@eleks-ui/components';
import { EleksUIThemeProvider, useEleksUITheme } from '@eleks-ui/theme';
```

Aliases (`@eleks-ui/components`, `@eleks-ui/theme`) are defined in both `tsconfig.base.json` and `vite.config.ts`.
Component source lives under `client/src/components/eleks-ui/` (`core/`, `x-components/`, `custom/`). `*.figma.tsx`
files are excluded from the build. There is also an `eleks-ui` skill with the full conventions — prefer it for any UI work.

## Backend architecture (functions/)

Three layers, cleanly separated:

1. **`functions/src/index.ts`** — the only file that exports Firebase entry points. Each `apiXxx` is a thin `onRequest` handler that calls a domain function, maps success/errors to HTTP status codes, and logs. `admin.initializeApp()` runs here before anything else is imported.
2. **`functions/src/functions/*.ts`** — domain logic (`writeRepository`, `getRepositoriesList`, `trackInstall`). These validate input with Zod, orchestrate the store, and throw typed errors (e.g. `NotFoundError`) that the handler translates to status codes.
3. **`functions/src/services/repositories-store.ts`** — the sole Firestore access layer. Owns collection names (`repositories`, `skills` subcollection), document shapes, the `repositorySchema`, and all read/write + per-skill install-counter operations. Domain code goes through this store rather than touching Firestore directly.

Data model: a `repositories` document holds repo metadata + `skills[]`; each skill is also a doc in that repo's `skills` subcollection carrying an `installCount`.

## Common commands

Run from the **repo root** unless noted.

```bash
npm run dev          # Vite dev server for the client
npm run build        # typecheck + vite build → dist/
npm run typecheck    # tsc -p tsconfig.client.json (no emit)
npm run lint         # eslint .
npm run test:run     # vitest run (client-side unit tests)
npm run emulators    # firebase emulators:start (auth:9099, functions:5001, firestore:8080, UI on)
```

### Functions (run inside `functions/`)

```bash
npm run test:run              # unit tests (*.spec.ts)
npm run test:integration      # integration tests (*.i.spec.ts) against a RUNNING emulator
npm run test:integration:ci   # build + spin up emulators, then run integration tests
npm run test:all              # unit + integration:ci (this is the deploy predeploy gate)
npm run serve                 # emulators for functions only
npm run deploy                # firebase deploy --only functions
```

Run a single test file / test with vitest: `npx vitest run path/to/file.spec.ts` or `npx vitest run -t "test name"`.

Integration specs (`*.i.spec.ts`) require the Firestore + Functions emulators and run **serially** (`fileParallelism: false`) because they share one emulator instance and clear/seed Firestore between runs. Emulator project/host config is in `functions/src/integration-specs/config.ts`.

### CLI (run inside `cli/`)

```bash
npm run build        # tsup → dist/ (bin at dist/bin.js)
npm run dev          # tsup --watch (NODE_ENV=development)
npm run test:run     # vitest run
```
