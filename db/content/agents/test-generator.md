---
slug: test-generator
name: Test Generator
description: Generate unit tests for a given function or module based on its signature and behaviour.
tags:
  - testing
  - codegen
agents:
  - cursor
  - claude-code
  - codex
installs: 52000
audit: audited
author: anthropics
createdAt: 2026-04-15
model: claude-opus-4-8
tools:
  - Read
  - Grep
  - Write
---

## Test Generator

Inspects a function's types, docstring, and usage sites, then generates a suite of unit tests covering:

- Happy path
- Edge cases (empty input, boundary values)
- Error paths (throws, rejects)

### Configuration

Pass `--effort low|medium|high` to control how exhaustively edge cases are explored.
