---
name: SkillStack Requirements
type: requirements-traceability
parent: wiki/architecture.md
status: final
created: 2026-07-19
updated: 2026-07-21
---

# Requirements — SkillStack

| id | Requirement |
| --- | --- |
| <a id="fr-cli1"></a>FR-CLI1 | `npx skillstack add <repo-url> [--skill <name>]` installs skill(s) into the local project |
| <a id="fr-cli2"></a>FR-CLI2 | Discover skills up to nesting depth 3; deeper not allowed |
| <a id="fr-cli3"></a>FR-CLI3 | Once `SKILL.md` found, take the whole skill directory (any sub-depth) |
| <a id="fr-cli4"></a>FR-CLI4 | No `--skill` given → list all discovered skills, user picks one or more |
| <a id="fr-cli5"></a>FR-CLI5 | Backend check: repo unknown → warn "unvalidated," install anyway if user agrees |
| <a id="fr-cli6"></a>FR-CLI6 | Repo known + validated + commit changed → let user choose stored (validated) vs. latest |
| <a id="fr-cli7"></a>FR-CLI7 | Repo known + not validated + commit changed → just install latest, no choice prompt |
| <a id="fr-cli8"></a>FR-CLI8 | After scan, prompt for target platform(s) — Claude/Cursor/Copilot, multi-select — install to the right folder per platform |
| <a id="fr-cli9"></a>FR-CLI9 | After install, fire telemetry — record the install, mark repo/skill(s) pending validation |
| <a id="fr-ui1"></a>FR-UI1 | Anyone can search validated skills (no login required) |
| <a id="fr-ui2"></a>FR-UI2 | Search covers both individual skills and whole repositories |
| <a id="fr-ui3"></a>FR-UI3 | GitHub login |
| <a id="fr-ui4"></a>FR-UI4 | Profile page shows GitHub info |
| <a id="fr-ui5"></a>FR-UI5 | Logged-in user uploads a repo/skill via URL → appears pending |
| <a id="fr-ui6"></a>FR-UI6 | "Validate" button triggers validation |
| <a id="fr-ui7"></a>FR-UI7 | Shows status + structured critical issues vs. non-critical recommendations |
| <a id="fr-ui8"></a>FR-UI8 | Manual validation always re-fetches latest from GitHub, never cache |
| <a id="fr-be1"></a>FR-BE1 | One `repositories` doc (owner, repo ref, commit hash, README blurb, calculated fields, timestamps) + `skills` subcollection |
| <a id="fr-be2"></a>FR-BE2 | Never store skill file content — commit hash only. Cross-cutting with [AD-6](architecture-invariants.md#ad-6)/[AD-7](architecture-invariants.md#ad-7). |
| <a id="fr-be3"></a>FR-BE3 | Search responses blend stored data + live GitHub metadata (stars, etc.) |
| <a id="fr-be4"></a>FR-BE4 | Daily auto-validation for unvalidated skills + on-demand for the owner |
| <a id="fr-be5"></a>FR-BE5 | Validation = Anthropic SDK check — security/convention (critical) + best practices (non-critical) |
| <a id="nfr1"></a>NFR1 | Firestore writes restricted to Cloud Functions only. See [AD-1](architecture-invariants.md#ad-1)/[AD-3](architecture-invariants.md#ad-3). |
| <a id="nfr2"></a>NFR2 | No skill file content stored server-side. Cross-cutting with [AD-6](architecture-invariants.md#ad-6)/[AD-7](architecture-invariants.md#ad-7). |
| <a id="nfr3"></a>NFR3 | Validation always fresh, never cached |
| <a id="nfr4"></a>NFR4 | Discovery capped at nesting depth 3 |
