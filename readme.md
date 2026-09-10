# SkillStack

A catalog of agent skills: browse them in the web app, install them with the CLI, persist state
in Firebase. The point of the repo is to **showcase AI infrastructure** running against a real
product.

Moodle:
[AI for Developers: Adoption via Engineering Practices](https://lms.eleks.com/course/view.php?id=619)

The skills in `.cursor/skills/` are not generic "write code" prompts. They're the usual
practices, written down: ship a change, add tests, review a diff, commit, check coverage. Same
habits, just runnable by an agent.

## How we work with AI here

We split the work on purpose. Three flows, with you holding the baton between them.

**1. Ship the change** (`implement`)

We score how hard it is (`requirements-complexity-agent`), then one specialist writes the code:
**Spark** for small, local diffs, **Octopus** when it sprawls. Tests and ADRs only if you say so.

**2. Protect it**

After implement we can cue tests, or you can run them on their own:

- `create-unit-tests` → **Unituna** (logic, branches, errors)
- `create-e2e-tests` → **E2eagle** (Playwright journeys)

Not every diff needs a new test.

**3. Review it** (`review`)

Several passes in parallel (coverage, security, Bugbot, "did we actually build what we asked
for", leftover scope). You still approve.

## Local

Not an npm workspace. Node `24.3.0` (`.nvmrc`), `tmux`.

```bash
nvm use
npm install
npm --prefix functions install
npm --prefix cli install
npm run dev
```

`npm run dev` → [`dev.sh`](dev.sh): tmux session `skillstack` (`firebase` | `cli` | `functions` |
`client`). Existing session → attach.

With emulators up:

```bash
npm --prefix functions run db:seed   # --fresh
```

## Tests

```bash
npm run test:run                       # client + shared
npm --prefix cli run test:run
npm --prefix functions run test:run    # unit
npm --prefix functions run test:all    # unit + integration (emulators)
npm run test:e2e                       # Playwright (emulators)
```
