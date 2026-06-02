# Contributing

## Version Control System

### Branching strategy

#### Model: Git Flow

We use a simplified Git Flow. Two long-lived branches, three short-lived types.

---

#### Permanent branches

| Branch    | Purpose                                              | Direct push  |
| --------- | ---------------------------------------------------- | ------------ |
| `main`    | Production-ready code only. Tagged on every release. | No — PR only |
| `develop` | Integration branch. Always deployable to staging.    | No — PR only |

---

#### Short-lived branch types

##### `feature/`

New functionality or improvements.

- Branch off: `develop`
- Merge into: `develop`
- Naming: `{type}/{issue-number}-{slug}`
- Example: `feature/42-user-login`
- Lifetime: until PR is merged. Delete after merge.
- PR rule: squash merge, 1 reviewer minimum.

##### `release/`

Stabilisation before a production release. Only bugfixes, no new features.

- Branch off: `develop`
- Merge into: `main` (tag it) + back-merge to `develop`
- Naming: `release/{semver}`
- Example: `release/1.2.0`
- Lifetime: days, not weeks.

##### `hotfix/`

Critical production bug that cannot wait for the next release cycle.

- Branch off: `main`
- Merge into: `main` (tag it) + back-merge to `develop`
- Naming: `hotfix/{issue-number}-{slug}`
- Example: `hotfix/99-payment-crash`
- PR rule: 1 reviewer minimum, expedited review SLA — 2 hours.

---

## Naming rules

### Pull request rules

- Title mirrors the commit format
- PR description uses the template in `.github/PULL_REQUEST_TEMPLATE.md`
- At least 1 approval required before merge
- CI must pass (lint + tests)
- No force-push to `main` or `develop`
- Branches are deleted after merge

### FAQ

- Can I push directly to `develop`?  
  ❌ No. Always a PR. Even for small fixes.

- My feature is just one commit — do I still need a branch?  
  ✅ Yes.

- Who resolves merge conflicts?  
  ⚠️ The author of the PR being merged.
