---
name: adjust-react-structure
description: Compares React client files with the feature-folder layout rule and returns a numbered list of placement suggestions. Use when asking to adjust structure with selected file(s)
---

# Identify React client structure

Source of truth: `.cursor/rules/client/react-structure-layout.mdc`.


## Scope

- Review only the files or folders the user named.
- If they did not name a path, review uncommitted files under `client/src`.
- If there is no named path and no uncommitted client files, ask which feature to review. Do not scan the whole client unless they ask.
- Ignore `client/src/components/eleks-ui`.

## 1. Compare files to the rule

For each in-scope file, decide whether its location matches the rule.
A suggestion is one concrete placement change. 

## 2. Output the suggestion list, then stop

Example of suggestions:

```markdown
## Structure suggestions

1. Move `client/src/hooks/useRepositories.ts` to `client/src/pages/RepositoriesList/hooks/useRepositories.ts`.
   The hook belongs to the Repositories feature. Update imports in `client/src/App.tsx`.
2. Place the new repository type at `client/src/pages/RepositoriesList/types/repository.ts`.
   Nothing else in the app uses this type.
```

Example of the case when no actions needed:

```markdown
## Structure suggestions

No placement changes. The reviewed files match the layout rule.
```

## 3. Ask about one change at a time

When the list has one or more suggestions, ask about one suggestion t a time only. 
Use the AskQuestion tool. One question. Two options: "Apply this change" and "Skip this change".

Prompt text: `Apply change 1: <one-line summary of the move or new path>?`

Do not include the other suggestions in that question.  
Ask again for the next item that has not been answered on its own.
Wait for the answer before doing anything else.

## 4. Refactor only an accepted change

- **Apply this change:** perform that one suggestion. Move the file, create missing parent folders, and update imports and tests that referenced the old path. Then show the resulting path. Then ask about the next suggestion the same way.
- **Skip this change:** leave those files where they are. Then ask about the next suggestion the same way.

Stop when every suggestion has been accepted or skipped and list the changes in the next format:
```markdown
filename (without path): old path -> new
```
