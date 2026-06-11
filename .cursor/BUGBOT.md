# SkillStack — Bugbot review rules

## Project context

- React 19 + TypeScript + Vite application.
- UI must use the **eleks-ui** design system: `@eleks-ui/components`, `@eleks-ui/theme`.
- Icons may use `@mui/icons-material` only.
- Component library lives under `src/components/eleks-ui/`.
- Path aliases: `@eleks-ui/components`, `@eleks-ui/theme` (see `vite.config.ts`).
- Husky: pre-commit runs lint-staged on `src/**/*.{js,ts,jsx,tsx}`; commit-msg runs commitlint; pre-push runs `npm test` (currently a placeholder).

## Severity policy

- **Blocking**: runtime bugs, security issues, raw MUI/third-party UI imports in app code, `any` in production code, dangerous dynamic execution, secrets in tracked files.
- **Non-blocking**: import order, comment style, PR hygiene, styling nits, missing tests (no real test suite yet).

---

## ELEKS UI

For files matching `src/**/*.{ts,tsx}` outside `src/components/eleks-ui/`:

If a changed file imports UI components from `@mui/material`, `@material-ui/core`, `antd`, `chakra-ui`, or similar instead of `@eleks-ui/components`, then:
- Add a **blocking** Bug titled "Use eleks-ui instead of raw MUI/third-party UI"
- Body: "Import components from `@eleks-ui/components` and theme from `@eleks-ui/theme`. Icons may use `@mui/icons-material`. Do not import from `@mui/material` for components available in eleks-ui."

If a changed file under `src/` (excluding `src/components/eleks-ui/`) uses a relative import into `src/components/eleks-ui/components/**` instead of the `@eleks-ui/*` aliases, then:
- Add a **non-blocking** Bug titled "Use @eleks-ui path aliases"
- Body: "Use `@eleks-ui/components` / `@eleks-ui/theme` per project conventions."

If a changed React component adds significant custom styling via inline `style={{}}` or raw hex colors instead of `sx` and theme tokens from `@eleks-ui/theme`, then:
- Add a **non-blocking** Bug titled "Prefer sx and theme tokens"
- Body: "Use the `sx` prop and design tokens from `@eleks-ui/theme` for colors, typography, and spacing."

When reviewing changes under `src/components/eleks-ui/components/**`, treat each component's local `index.tsx` as the source of truth if it differs from generic MUI patterns.

---

## TypeScript

For files matching `src/**/*.{ts,tsx}`:

If a changed production file introduces `any` (not in `*.d.ts` or obvious test doubles), then:
- Add a **blocking** Bug titled "Avoid any in production code"
- Body: "Use proper types, `unknown` with narrowing, or generics. Reserve `any` for unavoidable third-party gaps with a short `NOTE:` comment."

If a changed file disables TypeScript checking (`@ts-ignore`, `@ts-expect-error`) without an adjacent `NOTE:` comment explaining why, then:
- Add a **non-blocking** Bug titled "Document TS suppressions"
- Body: "Add a `NOTE:` comment per project rules, or fix the underlying type issue."

Prefer `interface` for object shapes. Use `Props` suffix for React prop types (e.g. `ButtonProps`).

---

## Code comments

If any changed file adds a comment that does not start with `NOTE:` (and is not license or generated code), then:
- Add a **non-blocking** Bug titled "Comment must use NOTE: prefix"
- Body: "Project convention: comments only for non-obvious nuances or upstream issue links, prefixed with `NOTE:`. Do not narrate implementation."

If a `NOTE:` comment links an issue, the URL must be a full `https://` link to a real upstream issue.

---

## Imports

For files matching `src/**/*.{js,jsx,ts,tsx}`:

If imports in a changed file violate this order (no blank line between groups): (1) Node built-ins, (2) external npm packages, (3) project/aliases, (4) styles last, then:
- Add a **non-blocking** Bug titled "Import order"
- Body: "Group imports: built-ins → external → project (`@eleks-ui/*`, `@/`) → styles. Separate groups with one blank line."

---

## React

For files matching `src/**/*.{tsx,jsx}`:

If a changed file uses deprecated React lifecycle methods (`componentWillMount`, `componentWillReceiveProps`, `componentWillUpdate`), then:
- Add a **blocking** Bug titled "Deprecated React lifecycle"
- Body: "Use `useEffect` or modern patterns. This is a function component codebase."

If a changed effect omits dependencies that are used inside the effect and ESLint would flag `react-hooks/exhaustive-deps`, then:
- Add a **blocking** Bug titled "Effect dependency issue"
- Body: "Fix the dependency array or document a deliberate omission with `NOTE:` and a stable pattern (e.g. ref guard)."

If a changed file maps over an array to render elements without a stable `key` prop, then:
- Add a **blocking** Bug titled "Missing key in list"
- Body: "Add a unique, stable `key` to each element in the mapped list."

Flag obvious bugs: accessing `window`/`document` during render without guards, or missing error handling on async user flows.

---

## Git Flow and PR hygiene

If the PR targets `main` and the head branch name does not match `hotfix/*` or `release/*`, then:
- Add a **non-blocking** Bug titled "Unexpected merge target"
- Body: "Feature work should merge to `develop` via `feature/*`. Only `hotfix/*` and `release/*` should target `main` per Git Flow."

If the PR targets `develop` and the branch name does not match `feature/*` or `release/*`, then:
- Add a **non-blocking** Bug titled "Branch naming"
- Body: "Use `feature/{issue-number}-{slug}` for enhancements, bugs, and docs per project Git Flow."

If the PR description does not reference a linked issue (`Closes #`, `Fixes #`, or similar) and the change is not clearly docs-only, then:
- Add a **non-blocking** Bug titled "Missing linked ticket"
- Body: "PR template expects `Closes #<number>`. Link the GitHub issue."

If the PR modifies user-facing UI under `src/` but the PR description has no "How to test" steps, then:
- Add a **non-blocking** Bug titled "Missing manual test steps"
- Body: "Add step-by-step verification instructions in the PR body."

---

## Commits

If commit messages in the PR use types other than `feat`, `fix`, or `docs`, or use types like `chore`, `refactor`, `style`, or `test`, then:
- Add a **non-blocking** Bug titled "Commit message may fail commitlint"
- Body: "Allowed types: feat, fix, docs. Header ≤ 50 chars; subject lowercase; optional scope in kebab-case. Squash-merge title should match: `type(scope): subject`."

---

## Security

If any changed file contains `/\beval\s*\(|\bnew\s+Function\s*\(/i`, then:
- Add a **blocking** Bug titled "Dangerous dynamic execution"
- Body: "Avoid eval and `new Function`. Use safe alternatives."

If the PR adds secrets, API keys, or `.env` values in tracked files, then:
- Add a **blocking** Bug titled "Possible secret in repo"
- Body: "Remove credentials; use environment variables and ensure `.env` is gitignored."

---

## Do not report

- Formatting-only changes that Prettier would produce.
- Missing unit tests when `npm test` is still a placeholder and no test files exist for the area.
- Changes confined to `.cursor/`, `readme.md`, or `CLAUDE.md` unless they introduce incorrect commands or security issues.
- Icons imported from `@mui/icons-material` (allowed).
- MUI imports inside `src/components/eleks-ui/` that intentionally wrap or extend MUI primitives.
