---
name: publish-github-task
description: >-
  Stage 3 of the task workflow: create a GitHub issue in dosandk/SkillStack
  from an approved Task Brief and add it to project board 10, by running the
  publish script. Use only after create-github-task produced a Brief file and
  the user approved it, or when the user supplies an approved Brief file and
  hash and asks to publish.
---

# Publish GitHub task

Final stage of **Analyze -> Approve -> Publish**. All validation and GitHub calls happen in
[scripts/publish-task.mjs](scripts/publish-task.mjs); this skill only runs it. Contract and
guarantees: [../create-github-task/reference.md](../create-github-task/reference.md).

## Hard rules

- Run `publish` only after the user explicitly approved the exact draft that produced the hash.
  Without such a reply in this conversation, stop and ask "Approve?".
- Never run `publish` in an auto-run mode: let the tool ask the user to confirm the command.
- Use only the script. Never call `gh issue create` or `gh project item-add` directly.
- Do not edit the Brief file. If anything must change, go back to `create-github-task`.
- If the script fails, show its message to the user. Do not retry `publish` without checking the
  output: when it prints an issue URL, the issue already exists.

## Steps

1. Run:
   ```bash
   node .agents/skills/publish-github-task/scripts/publish-task.mjs publish <brief.json> --approved-hash <hash>
   ```
2. On success the script prints `CREATED <url>`.
3. If the script reports that the issue was created but the board step failed, give the user the
   printed retry command (usually `gh auth refresh -s project` first).

## Report

Reply with the issue URL and number `#<n>`, and confirm it was added to the board. Suggest the
branch name `{type}/<n>-<slug>` and `Closes #<n>` for the PR.
