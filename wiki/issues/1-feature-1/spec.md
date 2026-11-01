# Spec: Feature 1 — Repository detail page

| Field    | Value                                                         |
| -------- | ------------------------------------------------------------- |
| Issue    | [#1](https://github.com/khomyakoleksandr/SkillStack/issues/1) |
| Type     | Feature                                                       |
| Surfaces | Web app, Backend API                                          |
| Revision | 2                                                             |

## Summary

Users can open a repository from the catalog and see every skill it contains, with its install count and (when available) a short description, and copy a ready-to-run CLI install command for each skill. This lets users find, judge and install a skill from the web app alone, so more catalog visits turn into installs.

## Background

The web app is a single page with a single list of repositories. Each row shows the repository name, its owner and a "N skills" chip. Rows are not clickable. Users cannot see which skills a repository contains, which are popular, or how to install them; they have to go to GitHub and then back to the terminal. Per-skill install counts are already recorded but are never shown to users. The existing list already has loading, empty and error states.

## Users and scenarios

- As a catalog visitor, I want to click a repository and see its skills, so that I know what it offers.
- As a catalog visitor, I want skills ordered by install count, so that I can spot the popular ones.
- As a catalog visitor, I want to copy the install command for a skill, so that I can paste it in my terminal without leaving the web app.

## Goals

- Make a repository's skills, descriptions and popularity visible in the web app.
- Let users go from browsing to a copied install command in one click.

## Non-goals

- Changing the CLI install command or its behavior.
- Storing skill descriptions at install time or otherwise persisting them (descriptions stay best effort, see BR-8).
- Searching, filtering or paginating skills (not requested).
- Showing skill file contents or anything beyond name, description and install count.
- Showing the install command text on the page next to each skill, other than in the copy-failure message (BR-5).

## Requirements

### Functional

- **FR-1**: The system shall make each repository in the catalog list navigable, so that clicking it opens that repository's own page with a unique, shareable address.
- **FR-2**: The repository page shall list every skill of the repository, showing for each its name and install count, and its short description when one is available (BR-1, BR-8).
- **FR-3**: The repository page shall sort skills by install count, highest first.
- **FR-4**: Each skill shall have a "Copy install command" button that puts the CLI install command for that skill on the user's clipboard, in the form `npx skillstack-cli add <repo-url> --skill <name>`, where `<repo-url>` is the repository's GitHub URL. The page shall show only the button, not the command text (human decision PG-1, PG-4).
- **FR-5**: The repository page shall show a loading state while data is being fetched, an empty state when the repository has no skills, and an error state when the data cannot be loaded.
- **FR-6**: The repository page shall identify the repository it belongs to (name and owner) and offer a way back to the catalog list (proposed).
- **FR-7**: The system shall provide the repository's details, including its skills and their install counts, to the web app on request (issue: "one new backend function to get a repository's details").

### Non-functional

- **NFR-1**: Skill names and install counts are visible within 2 s of opening the repository page, for a repository with up to 50 skills and a warm backend. Descriptions are outside this target and may appear later (human decision PG-3).
- **NFR-2**: The page is visually and behaviorally consistent with the existing catalog list.

### Business rules and edge cases

- **BR-1**: A skill with no description is still listed, without description text, and does not break the page (issue: descriptions are only "usually" available; confirmed by human decision PG-2).
- **BR-2**: A skill with zero installs is listed with a count of 0 (proposed).
- **BR-3**: Skills with equal install counts appear in a stable, predictable order, e.g. alphabetical by name (proposed).
- **BR-4**: Opening an address for a repository that does not exist shows a clear "not found" or error state rather than a blank page (proposed).
- **BR-5**: If the clipboard cannot be written (for example, permission denied), the user is told the copy failed, and the message contains the full install command text so the user can copy it by hand; a successful copy gives visible confirmation (proposed; command text in the message per human decision PG-4).
- **BR-6**: A failure to load one repository page does not affect the catalog list.
- **BR-7**: The copied command uses the skill's exact name and the repository's GitHub URL, in the form fixed by FR-4, so that pasting it into a terminal works as is without a global install of the CLI (issue: "working CLI command"; human decision PG-1).
- **BR-8**: Descriptions are loaded on a best-effort basis from each skill's own skill file on GitHub, and may be missing (for example under GitHub rate limits). Skills without a description are listed without one; a failure to load descriptions never shows an error state and never hides names or install counts (human decision PG-2).

## Constraints

- Install counts come from the data already stored per skill; no new tracking is introduced (source: issue).
- Descriptions come from the skill's own metadata at the top of its skill file where available, loaded best effort from GitHub (source: issue, human decision PG-2).
- The page is built from the existing ELEKS UI library parts (List, Chip, Button) (source: issue).
- The route shape `/repositories/:id` is given as an example in the issue and is not binding (source: issue).
- The copied command prefix is `npx skillstack-cli add` (source: human decision PG-1).

## Acceptance criteria

- [ ] **AC-1** (FR-1): Given the catalog list with at least one repository, when the user clicks a repository, then the repository's page opens at its own address showing that repository.
- [ ] **AC-2** (FR-2, FR-7): Given a repository with several skills, when its page loads, then every skill is listed with its name and install count, and with its short description when one is available.
- [ ] **AC-3** (FR-3, BR-3): Given a repository whose skills have different install counts, when its page loads, then skills appear highest count first, and skills with equal counts appear in a stable order.
- [ ] **AC-4** (FR-4, BR-7): Given a listed skill, when the user clicks "Copy install command", then the clipboard contains `npx skillstack-cli add <repo-url> --skill <name>` for that skill (with the repository's GitHub URL and the skill's exact name), the user sees confirmation, and the command text is not displayed on the page.
- [ ] **AC-5** (FR-5): Given the repository data is still loading, when the page is shown, then a loading state is displayed.
- [ ] **AC-6** (FR-5): Given a repository with no skills, when its page loads, then an empty state is displayed.
- [ ] **AC-7** (FR-5, BR-6): Given the data request fails, when the page loads, then an error state is displayed and the catalog list still works.
- [ ] **AC-8** (BR-1): Given a skill with no description, when the page loads, then the skill is still listed without description text and the page renders normally.
- [ ] **AC-9** (BR-2): Given a skill with no installs, when the page loads, then its install count shows 0.
- [ ] **AC-10** (BR-4): Given an address for a repository that does not exist, when the user opens it, then a not-found or error state is displayed.
- [ ] **AC-11** (BR-5): Given the clipboard cannot be written, when the user clicks "Copy install command", then the user is told the copy failed and the message contains the full install command text.
- [ ] **AC-12** (FR-6): Given the repository page is open, when the user looks at it, then the repository name and owner are visible and a control to return to the catalog is available.
- [ ] **AC-13** (NFR-1): Given a repository with up to 50 skills and a warm backend, when its page is opened, then skill names and install counts are visible within 2 s.
- [ ] **AC-14** (NFR-2): Given the page is rendered, when reviewed, then it looks and behaves consistently with the catalog list.
- [ ] **AC-15** (BR-8): Given descriptions cannot be loaded (for example GitHub is rate-limited or unreachable), when the page loads, then all skills are still listed with names and install counts, no error state is shown, and the skills have no description text.

## Open questions

- ~~Q-1~~ (answered: the copied command is `npx skillstack-cli add <repo-url> --skill <name>`, which works without a global install; `<repo-url>` is the repository's GitHub URL)
- ~~Q-2~~ (answered: descriptions are loaded best effort from each skill's skill file on GitHub and may be missing; skills without one are listed without one)
- ~~Q-3~~ (answered: names and install counts visible within 2 s of opening the page, up to 50 skills, warm backend; descriptions are outside the target)
- ~~Q-4~~ (answered: only the "Copy install command" button is shown; the command text appears in the copy-failure message)

## Feedback

- **PG-1** (plan.md): resolved by human decision. FR-4, BR-7, AC-4 and Constraints now use the prefix `npx skillstack-cli add <repo-url> --skill <name>`, which works without a global install; Q-1 answered.
- **PG-2** (plan.md): resolved by human decision. Added BR-8 and AC-15, reworded FR-2, FR-7, BR-1, AC-2 and AC-8, and added the constraint and a non-goal on persisting descriptions; Q-2 answered.
- **PG-3** (plan.md): resolved by human decision. NFR-1 and AC-13 now state the 2 s target for names and install counts (up to 50 skills, warm backend), with descriptions excluded; Q-3 answered.
- **PG-4** (plan.md): resolved by human decision. FR-4 and AC-4 state that only the button is shown; BR-5 and AC-11 require the full command text in the copy-failure message; Q-4 answered.
- **Note** (orchestrator): r1 was written before the `.cursor/` skills existed; r2 follows `pipeline-protocol` (IDs kept, `(proposed)` dropped from confirmed items).
