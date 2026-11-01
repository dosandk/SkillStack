---
name: create-issue
description: >-
  Turns raw requirement text from a business analyst (BA) into a well-structured
  GitHub issue and publishes it to the current repository via the gh CLI. Use
  when the user pastes BA notes, a user story, a feature request or a bug report
  and asks to create, file, open or publish an issue / task / ticket.
---

# Create Issue from BA Text

Turns unstructured BA input into a clean issue, gets the user's approval, then
publishes it with `gh`.

## Workflow

```
- [ ] 1. Resolve target repo and available labels
- [ ] 2. Classify the input (feature or bug)
- [ ] 3. Draft title + body from the matching template
- [ ] 4. Show the draft and wait for approval
- [ ] 5. Publish with gh and report the issue URL
```

### 1. Resolve repo and labels

Run in parallel:

```bash
gh repo view --json nameWithOwner,url
gh label list --limit 100
```

If `gh` is not authenticated, stop and ask the user to run `gh auth login`.

### 2. Classify the input

- **Bug**: describes broken or unexpected behavior → bug template, label `bug`.
- **Feature / change**: anything else → feature template, label `enhancement`.

Only use labels that exist in the `gh label list` output. Never create labels.

### 3. Draft the issue

Rules:

- **Title**: imperative mood, ≤ 70 chars, no trailing period, no type prefix
  (e.g. `Add CSV export to the skills table`, not `Feature: CSV export.`).
- **Preserve meaning, not wording.** Rewrite for clarity, but never invent
  requirements, numbers, names or deadlines that the BA did not state.
- Anything ambiguous, contradictory or missing goes into **Open questions**
  instead of being guessed.
- Acceptance criteria must be concrete and testable, written as `- [ ]`
  checkboxes. Derive them from the BA text; if the text gives none, propose
  them and say so in the approval message.
- Drop sections that would be empty (except Acceptance criteria).
- Wrap code identifiers, paths and commands in backticks.
- Write in English, even if the BA text is in another language, unless the
  user asks otherwise.

**Feature template:**

```markdown
## Summary
One or two sentences: what is needed and for whom.

## Motivation
- Why this matters / the problem it solves.

## Proposed solution
What should be built, at the level of detail the BA provided.

## Scope
- Bullet list of what is included.

## Acceptance criteria
- [ ] Concrete, verifiable outcome

## Out of scope
- Explicitly excluded items or follow-ups.

## Open questions
- Gaps or ambiguities in the original request.
```

**Bug template:**

```markdown
## Summary
One sentence describing the defect.

## Steps to reproduce
1. ...

## Expected behavior
...

## Actual behavior
...

## Environment
Browser / OS / version / environment, if provided.

## Acceptance criteria
- [ ] The defect no longer reproduces using the steps above

## Open questions
- Missing details needed to reproduce or fix.
```

### 4. Get approval

Show the user the full draft as markdown, plus the target repo and labels:

```
Repo:   owner/name
Title:  ...
Labels: enhancement

<body>
```

Ask: publish as-is, or what to change? **Do not publish without explicit
approval.** Apply requested edits and show the draft again.

### 5. Publish

Write the approved body to `.git/ISSUE_BODY.md`. It sits inside `.git`, so it is
never committed, and using a file avoids shell-quoting problems in PowerShell
and bash. Then run:

```bash
gh issue create --repo <owner/name> --title '<title>' --body-file .git/ISSUE_BODY.md --label <label>
```

- Use single quotes around the title. If the title contains a `'`, escape it as
  `''` in PowerShell or `'\''` in bash.
- Repeat `--label` for each label. Omit it if no suitable label exists.
- If the user asked for assignees, a milestone or a project, add `--assignee`,
  `--milestone` or `--project` accordingly.

After success, delete `.git/ISSUE_BODY.md` and reply with the issue number and
URL printed by `gh` as a markdown link.

## Example

**BA input:**

> Users complain they cant find skills quickly, need some search on main page,
> by name and maybe tags? should be fast. Also admins want to see how many
> installs each skill got.

**Draft:**

Title: `Add search to the skills list on the main page`

```markdown
## Summary
Let users quickly find skills on the main page by searching.

## Motivation
- Users report that finding a specific skill takes too long.

## Proposed solution
Add a search input above the skills list that filters results as the user types.

## Scope
- Search by skill name
- Search by tags

## Acceptance criteria
- [ ] A search input is visible on the main page
- [ ] Typing filters the skills list by name
- [ ] Typing filters the skills list by tag
- [ ] Results update without a full page reload

## Out of scope
- Showing install counts to admins (separate request; file as its own issue)

## Open questions
- Is tag search required for the first version, or optional ("maybe tags")?
- What does "fast" mean in measurable terms (e.g. results within 200 ms)?
```

If the BA text contains several unrelated requests (like the install-count
request above), suggest splitting them into separate issues. Draft each one
only if the user agrees.
