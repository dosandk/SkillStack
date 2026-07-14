---
name: eleks-ui
description: >
  Provides ELEKS UI conventions for React UI work in this project. Applies when
  creating, editing, or refactoring components, pages, forms, layouts, or views,
  including when the user does not mention ELEKS UI. All UI code must follow
  ELEKS UI import, discovery, and styling rules.
---

# ELEKS UI — Default Design System

This project uses **ELEKS UI** as its design system. Every React component must be built on top of it.
These rules apply by default whenever UI code is written or modified — ELEKS UI does not need to be requested explicitly.

**MCP order:** load this skill first for project-specific rules (imports, local overrides, styling).
Then follow eleks-ui MCP `serverUseInstructions` for tool calls, Figma workflows, and component docs.

## Import Rules (CRITICAL)

```ts
import { Button, TextField, Alert } from '@eleks-ui/components';
import { EleksUIThemeProvider, useEleksUITheme } from '@eleks-ui/theme';
import AcUnitIcon from '@mui/icons-material/AcUnit';
```

- UI components → `@eleks-ui/components`
- Theme utilities (provider, hook, tokens) → `@eleks-ui/theme`
- Icons → `@mui/icons-material`

**NEVER** import from `@mui/material`, `@material-ui/core`, relative paths to ELEKS UI internals,
or other third-party UI libraries (antd, react-bootstrap, chakra, etc.) for components available in ELEKS UI.

## Component Discovery

Before writing any UI, check what ELEKS UI already provides.
Always prefer an existing ELEKS UI component over building a custom one from scratch.

If the **eleks-ui MCP server** is configured, use it as the primary discovery and
documentation source — it has its own detailed instructions for tool usage, Figma workflows, and component lookup.
Follow those MCP instructions for discovery and docs, then return here for local override and styling rules.

If the MCP is **not** available, browse the local component files — see [reference.md](reference.md).

## Local Customizations

Users may modify standard ELEKS UI components or create entirely new ones. The local source files always have the final say:

- **Modified component** — if a component's `index.tsx` under `src/components/eleks-ui/components`
  differs from the MCP docs (extended props, changed behavior), treat the local file as the source
  of truth for that component.
- **User-created component** — components that don't exist in the standard ELEKS UI set won't appear in MCP results.
  Discover them by reading `src/components/eleks-ui/components` directly.
- **When both sources exist** — use MCP docs for canonical usage patterns, then check the local `index.tsx`
  to see if the component was customized. Local overrides MCP where they conflict.

## Styling

- Use the `sx` prop for component-level styles.
- Use design-system tokens from `@eleks-ui/theme` for colors, typography, and spacing.
- Follow the styling patterns already adopted in the codebase.

## Workflow

1. **Discover** — if the MCP is available, follow its instructions to find and get docs for components.
   Otherwise browse `src/components/eleks-ui/components` per [reference.md](reference.md).
2. **Check for local overrides** — read the component's `index.tsx` under `src/components/eleks-ui/components`
   to see if it was customized or if the component is user-created. Local files override MCP docs where they conflict.
3. **Implement** — write code using `@eleks-ui/components` and `@eleks-ui/theme` imports.
4. **Missing component** — if a component doesn't exist in MCP results or local files, stop.
   Do not substitute `@mui/material`, antd, or other UI libraries.
   State in the response: `BLOCKED: <component-name> — not found in ELEKS UI (MCP or local src/components/eleks-ui/components)`.

## Example

**Request:** "Add a login form with email, password, and submit button."

1. MCP available → `search_components` with query `login form` or `text field`;
   `get_component_docs_batch` for `TextField`, `Button`.
2. Read `src/components/eleks-ui/components/core/TextField/index.tsx` and `core/Button/index.tsx` for local overrides.
3. Implement:

```tsx
import { Box, Button, TextField } from '@eleks-ui/components';
```

4. Style with `sx` and theme tokens; no `@mui/material` imports.

## Quality Checklist

Before marking UI work complete:

- [ ] Imports from `@eleks-ui/components` and `@eleks-ui/theme` only (icons from `@mui/icons-material`)
- [ ] No `@mui/material`, antd, chakra, or other third-party UI component libraries
- [ ] Local `index.tsx` checked for customizations when MCP docs exist
- [ ] Styles use `sx` and design-system tokens from `@eleks-ui/theme`
- [ ] Existing ELEKS UI component reused instead of a custom rebuild where possible
