---
slug: filesystem
name: Filesystem MCP
description: Model Context Protocol server exposing safe read/write access to a local directory tree.
tags:
  - filesystem
  - integration
agents:
  - cursor
  - claude-code
  - codex
  - copilot
installs: 105000
audit: audited
author: anthropics
createdAt: 2026-01-10
server: npx -y @modelcontextprotocol/server-filesystem
transport: stdio
---

## Filesystem MCP

Provides structured `read_file`, `write_file`, `list_directory`, and `search_files` tools scoped to a configured root path.

### Configuration

Pass the allowed root directory as the first argument when starting the server.
