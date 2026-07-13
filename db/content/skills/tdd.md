---
slug: tdd
name: Test-Driven Development
description: Guide an agent to write a failing test first, then implement just enough code to pass it.
tags:
  - testing
  - workflow
agents:
  - cursor
  - claude-code
  - codex
installs: 95000
audit: audited
author: mattpocock
createdAt: 2026-02-10
install: npx skillstack add mattpocock/tdd
---

## Test-Driven Development

Instructs the agent to follow a strict red-green-refactor loop for every change.

### Steps

1. Write a failing test that describes the desired behaviour.
2. Implement the minimum code to make it pass.
3. Refactor without breaking the test.

### When to use

- Adding a new function, hook, or API endpoint.
- Fixing a regression where a test should have caught the bug.
