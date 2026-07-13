---
slug: supabase
name: Supabase MCP
description: Model Context Protocol server for Supabase — query tables, manage migrations, and inspect schemas.
tags:
  - database
  - supabase
  - integration
agents:
  - cursor
  - claude-code
installs: 72000
audit: audited
author: supabase
createdAt: 2026-02-20
server: npx -y @supabase/mcp-server-supabase
transport: stdio
---

## Supabase MCP

Gives an agent structured access to a Supabase project: run SQL queries, list tables, apply migrations, and read RLS policies.

### Configuration

Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` before starting the server.
