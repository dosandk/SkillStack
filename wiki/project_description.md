# SkillStack Architecture

SkillStack is a catalog of skills modelled after [skills.sh](https://www.skills.sh/). It is a teaching prototype
for a course on using Claude Code / Cursor capabilities well.

## Monorepo layout (single root `package.json`)

The whole repo (except CLI) is one npm package (no workspaces). Folders are separated by responsibility,
and cross-folder imports go through TypeScript path aliases (`@shared`, `@eleks-ui/*`).

| Folder       | Responsibility                                                                                                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client/`    | React 19 + Vite front end. Vite `root` is `client/`.                                                                                                                                           |
| `functions/` | Firebase Cloud Functions — the backend.                                                                                                                                                        |
| `shared/`    | Zod schemas + inferred TS types. Single source of truth, used by both sides. If both firebase functions and client can use those interfaces, we can keep it, otherwise - to be deleted as well |
| `wiki/`      | This documentation. `project_description.md` (this file), a story catalogue (`wiki/stories/` — end-to-end user stories, each with E2E test scenarios), module-scoped tasks (`wiki/tasks/` — frontend/backend/cli work items with unit/integration test requirements), and `wiki/templates/` for both. No ADRs or backlog currently checked in. |
| `.cursor/`   | Cursor rules/skills applied across the repo.                                                                                                                                                   |

Apart from that there is a `/cli` folder which is a separate npm package that users use to install any skill from any Github repo using the console command like in [skills.sh](https://www.skills.sh/). For example: `npx skills add https://github.com/anthropics/skills --skill frontend-design`

## Existing features

Currently, we have defined tech stack, set up frontend to display skills, added github authorization logic, basic empty cloud function, and cli setup, no firestore yet. Both client and server (functions) are deployed, authorization is working, cli is published to NPM

## Expected Functionality (Requirements)

### CLI

The user installs a local npm package that, when executed with a command such as:

`npx skillstack add https://github.com/anthropics/skills --skill frontend-design`

adds skills from the specified GitHub repository to the user’s project.

The CLI must be able to discover skills in the repository up to a maximum depth of 3 nested levels. In other words, a skill may be located:

- at the repository root as a single SKILL.md file;
- in a directory, for example /skills/name-of-skill/SKILL.md;
- in a nested subdirectory, for example /skills/frontend-skills/name-of-skill/SKILL.md.

Deeper nesting is not allowed.

Once a SKILL.md file has been found, the CLI must take the entire skill directory, including all subdirectories, regardless of nesting depth.

When working with the CLI, the following scenarios are possible:

1. The skill(s) have never been installed via the CLI

- Using the GitHub API, the CLI scans the specified repository and finds the requested skill. If no skill is specified, it shows the user all available skills in that repository. The user can then select one or more skills to install into the project.
- The CLI calls the corresponding cloud function, which checks Firestore to determine whether the repository already exists in the database. If it does not exist, the CLI displays a warning that the repository is unvalidated, so the user installs the selected skill(s) at their own discretion.
- If the user agrees, the CLI prompts them to choose target platforms such as Claude, Cursor, and Copilot (multiple options may be selected), and installs the skill(s) into the appropriate folder in the local project.
- After installation, the CLI triggers telemetry that sends a request to a cloud function. That function writes to the database that the repository was used, the installation was completed, and the repository with the specified set of skills (or a single skill) is awaiting later validation by the system.

2. The skill(s) have already been installed via the CLI, and someone installs them again

- Using the GitHub API, the CLI scans the specified repository and finds the requested skill. If no skill is specified, it shows the user all available skills in that repository. The user can then select one or more skills to install into the project.
- The CLI calls the corresponding cloud function, which checks Firestore to determine whether the repository already exists in the database. Since it does exist, the API returns the stored commit hash and the validation status of each skill (pending, approved, or failed).
- If the latest commit in the repository differs from the commit hash stored in the database, this means the repository owner has updated it. If the stored version has not yet been validated, the CLI simply installs the selected skill(s) as in scenario 1. If the stored version has already been validated, the CLI informs the user that changes have occurred and lets them choose which version to install. If the user chooses the updated version, the CLI again triggers telemetry after installation, sending a request to a cloud function that updates the database to record another installation and marks the repository with the specified set of skills (or a single skill) as awaiting future validation.

### UI

- Any user can search for and view only skills that have passed validation.
- Any user can search for both individual skills and entire repositories.
- A user can log in with GitHub.
- A logged-in user has access to a profile page containing their GitHub information.
- A logged-in user can upload their repositories/skills using a URL input field. After upload, the skill (or repository with a list of skills) appears with pending status and waits for validation.
- A logged-in user can validate their repository or an individual skill using a Validate button. After validation, the UI displays the status and presents, in a structured form, recommendations/warnings that are non-critical, as well as critical issues that prevent the skill(s) from passing validation.
- The manual validation process always fetches the latest version from GitHub.

### Backend (Firebase Cloud Functions) & Firestore

- The backend is built on Cloud Functions.
- The backend works with Firestore, where we do not store the actual skill files physically, only the GitHub commit hash.
- There is a single collection that contains:
  - user data (repository owner with skills),
  - repository reference,
  - a subcollection of skills with:
    - name,
    - validation status,
    - record creation and update timestamps,
    - installation count from telemetry,
  - GitHub commit hash,
  - a short description from the README to help understand what the repository is about,
  - a calculated validation status for the entire repository,
  - record creation and update timestamps,
  - a calculated installation count field.
- When a user searches for a skill or repository through the UI, the API returns the commit hash from the database and also queries the GitHub API to display up-to-date information, including additional metadata such as GitHub stars.
- The backend can run automatic validation for unvalidated skills once per day, as well as on demand when requested by a logged-in user for their own skill or an entire repository.
- Validation is a check of the skill for security and adherence to the documented conventions. It is performed using an LLM through the relevant API, for example the Anthropic SDK. Validation should also check for best practices, which are non-critical requirements.
