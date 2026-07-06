# Backlog

Structured stories for SkillStack, formatted to map onto a GitHub Projects board
(each `###` heading → an issue; the fields → issue body). Status: `todo` / `in-progress` / `done`.

---

### STORY-001: Monorepo scaffold + vertical slice

- **Status:** done
- **Epic:** Foundation
- **Description:** Restructure into a single-package monorepo (`client`/`server`/`shared`/`db`/
  `wiki`) and wire one end-to-end slice: markdown → db repository → Express API → client render.
- **Acceptance criteria:**
  - `npm run dev` starts client (:5173) and server (:3001) together.
  - `GET /api/{skills,rules,mcps,agents}` each return their seeded entry.
  - The client lists entries fetched from the API as cards.
  - `npm run typecheck` passes.

### STORY-002: Entry detail page

- **Status:** todo
- **Epic:** Catalog
- **Description:** Add a detail view that fetches `GET /api/:type/:slug` and renders the markdown
  body (add `react-markdown`), plus type-specific fields (install command, MCP transport, etc.).
- **Acceptance criteria:**
  - Clicking a card navigates to `/:type/:slug` (add a router).
  - Markdown body renders as formatted HTML.
  - A 404 from the API shows a not-found state.

### STORY-003: Search and tag filtering

- **Status:** done
- **Epic:** Catalog
- **Description:** Let users filter the catalog by free-text query and tags across all types.
- **Acceptance criteria:**
  - A search box filters the visible list client-side (or via a query param).
  - Selecting a tag narrows results; multiple tags combine.

### STORY-004: User-created entries (write path)

- **Status:** todo
- **Epic:** Authoring
- **Description:** Allow authenticated users to create/edit their own entries via the UI. This is
  the trigger to implement `MongoContentRepository` (see ADR 0002).
- **Acceptance criteria:**
  - A form creates a new entry validated against the shared Zod schema.
  - New entries persist and appear in listings.
  - `ContentRepository` gains create/update; a Mongo implementation backs it.

### STORY-005: Publish backlog to GitHub Projects

- **Status:** todo
- **Epic:** Ops
- **Description:** Script/action to sync these stories to a GitHub Projects board.
- **Acceptance criteria:**
  - Each `###` story becomes an issue with labels for epic and status.
  - Re-running updates existing issues rather than duplicating them.

---

### STORY-006: Light/dark theme switcher

- **Status:** done
- **Epic:** UI
- **Description:** Toggle between the eleks light and dark MUI themes from the app header.
- **Acceptance criteria:**
  - A sun/moon `IconButton` in the top-right of the header switches the theme.
  - Theme state lives in the existing `EleksUIThemeProvider`.

### STORY-007: Install command + copy button

- **Status:** done
- **Epic:** Catalog
- **Description:** Show a one-liner install command on skill cards with a copy-to-clipboard button.
- **Acceptance criteria:**
  - Cards where `install` is set show a monospace command line.
  - Clicking the copy icon copies the command and switches to a green checkmark for 2 seconds.

### STORY-008: Popularity / leaderboard sort

- **Status:** done
- **Epic:** Catalog
- **Description:** Add a static `installs` field to all entries; use it to power the All Time sort tab.
- **Acceptance criteria:**
  - All entries have an `installs` count shown in the card subheader.
  - The All Time tab sorts by `installs` descending.

### STORY-009: Trending / Hot / All Time tabs

- **Status:** done
- **Epic:** Catalog
- **Description:** Three time-windowed sort views on the catalog listing.
- **Acceptance criteria:**
  - **All Time** — sorted by `installs` desc.
  - **Hot** — sorted by `createdAt` desc (newest first).
  - **Trending** — sorted by `installs ÷ age-in-days` desc (recency-weighted).
  - Card subheader shows a human-friendly age (e.g. "14 days ago").

### STORY-010: Agent compatibility tags

- **Status:** done
- **Epic:** Catalog
- **Description:** Tag entries with which AI agents they support; filter the catalog by agent.
- **Acceptance criteria:**
  - All entries have an `agents` list in frontmatter.
  - Cards show agent chips (`color="primary"`, outlined).
  - A row of clickable filter chips (cursor, claude-code, codex, copilot) narrows the list.

### STORY-011: Security audit status badge

- **Status:** done
- **Epic:** Catalog
- **Description:** Entries carry an `audit` status shown as a colored badge on cards.
- **Acceptance criteria:**
  - `audited` → green chip, `pending` → orange chip, `none` → no chip.

---

### STORY-012: Topic pages

- **Status:** todo
- **Epic:** Catalog
- **Description:** Curated topic groups (React, Design, Databases, Agent Workflows) that filter the catalog to related entries.
- **Acceptance criteria:**
  - A topic nav filters the listing to entries matching that topic's tags.
  - Topics are browsable at `/topics/:topic`.

### STORY-013: Author profile page

- **Status:** todo
- **Epic:** Catalog
- **Description:** Group entries by author; show all their entries and total installs at `/authors/:name`.
- **Acceptance criteria:**
  - Author name in the card subheader is a link to their profile page.
  - Profile page lists all entries by that author with a total install count.

### STORY-014: Official / verified badge

- **Status:** todo
- **Epic:** Catalog
- **Description:** A frontmatter `official: boolean` flag; displayed as a badge on cards and the detail page.
- **Acceptance criteria:**
  - Entries with `official: true` show a verified badge.
  - An "Official" filter tab or chip narrows the list to official entries only.

### STORY-015: Related entries on detail page

- **Status:** todo
- **Epic:** Catalog
- **Description:** On the entry detail page, show up to 3 entries that share tags or the same author.
- **Acceptance criteria:**
  - A "Related" section appears at the bottom of the detail page.
  - Entries are ranked by number of shared tags, then same author.

### STORY-016: CLI install script

- **Status:** todo
- **Epic:** Distribution
- **Description:** `npx skillstack add <slug>` copies a skill's markdown file into the user's project.
- **Acceptance criteria:**
  - Running the command downloads the matching `.md` file into `.cursor/skills/`.
  - Unknown slugs print a helpful error with a link to the catalog.

### STORY-017: All types filter + type chip

- **Status:** done
- **Epic:** Catalog
- **Description:** Add an "All" button that shows every entry across all four types, and display a type chip on every card so the type is always visible.
- **Acceptance criteria:**
  - An "All" button is the default selection and fetches all 4 types in parallel.
  - Clicking a type button narrows the list to that type only.
  - Every card shows a chip with its content type (skill, rule, mcp, agent).
