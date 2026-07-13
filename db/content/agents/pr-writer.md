---
slug: pr-writer
name: PR Writer
description: Draft a pull-request title, summary, and test plan from the current diff.
tags:
  - git
  - workflow
agents:
  - cursor
installs: 22000
audit: none
author: eleks
createdAt: 2026-06-10
model: claude-sonnet-4-5
tools:
  - Read
  - Grep
  - Bash
---

## PR Writer

Reads the staged diff and produces a ready-to-paste GitHub pull-request description.

### Output format

```
## Summary
- <bullet 1>
- <bullet 2>

## Test plan
- [ ] <step>
```

### Rules

- Keep the summary to 3 bullets or fewer.
- Each test-plan item must be manually verifiable.
