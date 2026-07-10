---
id: feature-foundation-platform
title: Foundation — Monorepo & Deployment
status: done
owner: @unassigned
domain: foundation
created: 2026-07-10
updated: 2026-07-10
---

# Feature: Foundation — Monorepo & Deployment

## Description

Single-package monorepo (`client`/`functions`/`shared`/`wiki`, plus a standalone
`cli` package) wired with TypeScript path aliases (`@shared`, `@db`, `@eleks-ui/*`).
React 19 + Vite front end and Firebase Cloud Functions back end are both deployed;
the CLI is published to NPM. This is the platform baseline every other feature builds on.

## Tickets

| Ticket | Status | Description                              |
| ------ | ------ | ---------------------------------------- |
| SS-001 | done   | Monorepo scaffold + TypeScript path aliases |
| SS-002 | done   | Deploy client and Cloud Functions        |

## Dependencies

- Depends on: (none — baseline)
- Used by: all other features
