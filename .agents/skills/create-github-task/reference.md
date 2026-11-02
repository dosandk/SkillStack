# Task Brief contract

Shared by `create-github-task` (stages 1-2) and `publish-github-task` (stage 3). The rules below
are **enforced in code** by
[`publish-task.mjs`](../publish-github-task/scripts/publish-task.mjs); this file only documents them.

## Task Brief

Handoff object between stages, stored as a JSON file (for example in `$TMPDIR`).

```json
{
  "type": "feature",
  "title": "Add multi-stage create-github-task workflow",
  "description": "Why the task exists and what it changes, 2-5 sentences.",
  "acceptance_criteria": ["Verifiable outcome 1", "Verifiable outcome 2"]
}
```

| Field                 | Enforced rule                                              |
| --------------------- | ---------------------------------------------------------- |
| `type`                | `bug`, `feature`, or `docs`                                |
| `title`               | Non-empty single line, at most 70 chars, no trailing period |
| `description`         | Non-empty string, no secrets                               |
| `acceptance_criteria` | 1-6 non-empty strings                                      |

Any other field makes the Brief invalid. The label comes from `type`:
`bug` -> `bug`, `feature` -> `enhancement`, `docs` -> `documentation`.

One Brief is one issue. If the request holds several independent tasks, propose a split first.
Imperative wording and verifiable criteria are not machine-checkable: review them yourself.

## Commands

```bash
# Stage 1: validate, check for an exact-title duplicate, print the approval hash (read-only)
node .agents/skills/publish-github-task/scripts/publish-task.mjs check <brief.json>

# Stage 3: re-validate, create the issue, add it to project 10
node .agents/skills/publish-github-task/scripts/publish-task.mjs publish <brief.json> --approved-hash <hash>
```

The hash covers type, title, description, and criteria. `publish` fails if the Brief changed after
the hash was shown to the user, so an edit always requires a new `check` and new approval.

## What the script guarantees

- Invalid Brief: nothing is created.
- Exact-title duplicate (case-insensitive, any state): nothing is created.
- No `--assignee` (contributors have read-only access, and `gh` creates the issue before failing).
- If adding to the board fails after the issue exists, the script prints the issue URL and the
  retry command. Do not create another issue.

## What the script cannot guarantee

That a human approved. Approval is the agent's responsibility: show the draft and publish only
after an explicit yes ("approve", "yes", "ok"). The strongest guard is the tool's own command
confirmation: do not add `publish-task.mjs` to the auto-run allowlist in Cursor or Copilot, so every
`publish` needs a click from the user.

## Link to the delivery process

Branches follow `{type}/{issue-number}-{slug}` and pull requests use `Closes #<n>`
(see `contributing.md`).
