---
description: Import order for JS/TS modules — built-ins, libraries, project, then styles
globs: "**/*.{js,jsx,mjs,cjs,ts,tsx}"
alwaysApply: false
---

# JavaScript module import order

When adding or editing imports in a module, use this order. Separate each group with one blank line.

## 1. Built-in modules

Node.js / runtime built-ins (`node:` prefix or bare name):

```ts
import path from 'node:path';
import fs from 'node:fs';
```

## 2. External libraries

npm packages and third-party dependencies:

```ts
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@eleks-ui/components';
```

## 3. Project-level dependencies

Relative paths, path aliases (`@/`, `@eleks-ui/`), and other in-repo modules:

```ts
import App from './App.tsx';
import { formatDate } from '@/utils/formatDate';
```

## 4. Styles (last)

All style imports go **after** every JavaScript/TypeScript import:

```ts
import './index.css';
import styles from './App.module.css';
```

## Example (full block)

```ts
import path from 'node:path';

import express from 'express';
import { Button } from '@eleks-ui/components';

import { apiClient } from '@/api/client';
import App from './App.tsx';

import './App.css';
```
