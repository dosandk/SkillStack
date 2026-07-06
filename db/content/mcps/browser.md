---
slug: browser
name: Browser MCP
description: Model Context Protocol server that gives an agent a controllable browser via Playwright.
tags:
  - browser
  - automation
  - testing
agents:
  - cursor
  - claude-code
  - codex
installs: 31000
audit: pending
author: vercel-labs
createdAt: 2026-06-01
server: npx -y @modelcontextprotocol/server-playwright
transport: stdio
---

## Browser MCP

Lets an agent open pages, click elements, fill forms, and capture screenshots — useful for E2E testing and web scraping tasks.

### Configuration

Requires a local Playwright installation (`npx playwright install`).
