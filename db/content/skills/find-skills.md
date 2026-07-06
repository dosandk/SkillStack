---
slug: find-skills
name: Find Skills
description: Discover and install the right skill for a task from the SkillStack catalog.
tags:
  - discovery
  - meta
agents:
  - cursor
  - claude-code
  - codex
installs: 142000
audit: audited
author: vercel-labs
createdAt: 2026-01-15
install: npx skillstack add vercel-labs/find-skills
---

## Find Skills

A meta-skill that helps an agent search the catalog and pick the most relevant
skill for the task at hand, then install it on demand.

### When to use

- The user asks for a capability you don't currently have loaded.
- You want to check whether a reusable skill already exists before writing code.

### How it works

1. Query the catalog by keyword and tags.
2. Rank candidates by description relevance.
3. Install the winning skill and follow its instructions.
