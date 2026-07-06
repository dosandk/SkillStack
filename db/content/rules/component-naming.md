---
slug: component-naming
name: Component Naming
description: Naming conventions for React components, files, props, and hooks in this codebase.
tags:
  - react
  - naming
  - conventions
agents:
  - cursor
  - claude-code
installs: 18000
audit: none
author: eleks
createdAt: 2026-06-25
appliesTo:
  - "client/**/*.tsx"
---

## Component Naming

### Files

- One component per file.
- File name matches the component name in PascalCase: `UserCard.tsx`.
- Index barrel files (`index.tsx`) only for directory-level re-exports.

### Components

- PascalCase for all React components.
- Boolean props prefixed with `is`, `has`, or `can`: `isLoading`, `hasError`.
- Event handler props prefixed with `on`: `onSubmit`, `onTagClick`.

### Hooks

- Custom hooks prefixed with `use` and camelCase: `useContent`, `useEleksUITheme`.
