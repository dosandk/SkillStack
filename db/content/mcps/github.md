---
slug: github
name: GitHub MCP
description: Model Context Protocol server exposing GitHub issues, PRs, and repositories.
tags:
  - github
  - integration
agents:
  - cursor
  - claude-code
installs: 95000
audit: pending
author: github
createdAt: 2026-01-22
server: npx -y @modelcontextprotocol/server-github
transport: stdio
---

## GitHub MCP

Gives an agent structured access to GitHub: read and comment on issues and pull
requests, inspect repository contents, and open new issues.

### Configuration

Set `GITHUB_TOKEN` in the environment before starting the server. Grant only the
scopes the workflow needs.
