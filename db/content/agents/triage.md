---
slug: triage
name: Triage
description: Quickly classify an incoming bug report and route it to the right epic or owner.
tags:
  - workflow
  - issues
agents:
  - cursor
  - claude-code
installs: 45000
audit: pending
author: mattpocock
createdAt: 2026-03-05
model: claude-sonnet-4-5
tools:
  - Read
  - Grep
  - WebFetch
---

## Triage

Reads a bug report, classifies its severity and type, and suggests an epic label and owner.

### Output

- **Severity**: critical / high / medium / low
- **Type**: regression / performance / ux / security / other
- **Suggested epic**: based on the affected files
- **Suggested owner**: based on recent git blame
