---
name: review
description: >-
  Post-implementation review of changed code — test coverage quality, security,
  defects, acceptance criteria, and repo quality gates.
---

# Review

Orchestrate a **read-only** multi-dimensional review of the current change set.

## Hard rules

- **Read-only by default** — report findings; do not edit source, commit, or push.
- **Default diff scope:** `uncommitted changes` (staged + unstaged vs HEAD). Use
  `branch changes` only when the user asks to review the whole branch or a PR.
- **Reuse task context** when available — goal, acceptance criteria, packages, and
  test classification from the implement summary.
- **Run independent dimensions in parallel** when tool limits allow (security +
  bugbot subagents).
- **Skip irrelevant dimensions** — record `skipped — <reason>` instead of running
  empty checks.
- **No fix loop** — do not rerun review or apply patches unless the user asks.

---

## Workflow

Copy this checklist to track progress.
Show review progress step by step in the main output.

```
Review progress:
- [ ] Step 1: Resolve scope and context
- [ ] Step 2: Classify dimensions to run
- [ ] Step 3: Coverage review (run in parallel)
- [ ] Step 4: Security review (run in parallel)
- [ ] Step 5: Defect review (Bugbot) (run in parallel)
- [ ] Step 6: Acceptance criteria check (run in parallel)
- [ ] Step 7: Optional quality gates (as classified) (run in parallel)
- [ ] Step 8: Unified report

```

### Step 1 — Resolve scope and context

From git and conversation context, capture:

- **Diff mode:** `uncommitted changes` (default) or `branch changes`
- **Packages touched:** `client/`, `functions/`, `cli/`, `shared/`, config only, etc.
- **Changed files** — `git diff --name-only` (+ `--cached` when uncommitted)
- **Task brief** — goal + acceptance criteria (from implement Step 1/7 if present)
- **Test routing** — `unit | e2e | both | none` from implement Step 6 if present

If the diff is empty, stop: "No changes to review."

Repository path: absolute workspace root.

### Step 2 — Classify dimensions

Always run Steps 3–6. Run Step 7 checks only when the trigger column applies:

| Dimension            | Step | Run when                                                                |
| -------------------- | ---- | ----------------------------------------------------------------------- |
| Coverage             | 3    | Product code changed in testable packages                               |
| Security             | 4    | Any product or config change                                            |
| Defects (Bugbot)     | 5    | Any product code change                                                 |
| Acceptance criteria  | 6    | Task brief or acceptance criteria available                             |
| Complexity           | 7    | `.ts`/`.tsx`/`.js`/`.jsx` changed in `client/`, `functions/`, or `cli/` |
| Duplicates           | 7    | 3+ source files changed, or new shared logic / handlers / schemas       |
| NPM vulnerabilities  | 7    | `package.json` or lockfile changed in any package                       |
| Firestore rules      | 7    | `firestore.rules`, store layer, or auth-sensitive paths changed         |
| ELEKS UI conventions | 7    | `client/` UI components or pages changed                                |

Record which optional dimensions run vs skip before Step 3.

---

### Step 3 — Coverage review

Run this step in parallel.

Assess **quality of test protection**, not just line percentages.

#### 3a — Map change → tests

For each changed source file (exclude tests, configs, types-only re-exports):

1. Find colocated or mirrored tests: `*.spec.ts`, `*.spec.tsx`, `*.i.spec.ts`.
2. For each new/changed **behavior** (branch, validation, error path, public API,
   hook return shape, HTTP status mapping), note whether a test asserts it.
3. Cross-check implement Step 6 classification:
   - If **unit** was expected but no unit specs touch the behavior → gap.
   - If **e2e** was expected but no Playwright spec covers the journey → gap.
   - If **none** was chosen, confirm the change truly has no testable contract.

#### 3b — Run coverage (when practical)

Run coverage only for packages with changed testable source:

| Package       | Command (from package dir or repo root per project scripts) |
| ------------- | ----------------------------------------------------------- |
| client/shared | `npm run test:coverage` (repo root vitest projects)         |
| functions     | `cd functions && npm run test:coverage`                     |
| cli           | `cd cli && npm run test:run` (coverage if script exists)    |

Focus the report on **changed files**, not whole-repo totals.

#### 3c — Coverage verdict

Assign one overall label:

- **Strong** — meaningful behaviors covered; gaps are trivial or justified.
- **Normal** — core paths covered; minor gaps listed.
- **Weak** — important behavior untested; list each gap with file and suggested test type (`unit` / `e2e` / `integration`).

---

### Step 4 — Security review

Run this step in parallel.

Launch exactly one `security-review` subagent:

- `subagent_type: "security-review"`
- `run_in_background: false`
- `description: "Security Review"`

Prompt (same shape as review-security skill):

```text
Full Repository Path: <absolute workspace path>
Diff: <uncommitted changes | branch changes>
Custom Instructions: Post-implement review. Focus on vulnerabilities introduced by
this change — injection, authz, secrets, unsafe defaults, Firestore exposure, client-side trust boundaries.
```

On subagent failure: retry once with corrected prompt; if still failing, record
`blocked — <error>` and continue other dimensions.

Summarize: finding count by severity, or "no issues". Do not paste full subagent
output unless the user asks.

---

### Step 5 — Defect review (Bugbot)

Run this step in parallel.

Launch exactly one `bugbot` subagent:

- `subagent_type: "bugbot"`
- `run_in_background: false`
- `description: "Bugbot"`

```text
Full Repository Path: <absolute workspace path>
Diff: <uncommitted changes | branch changes>
Custom Instructions: Post-implement review. Focus on correctness regressions, edge cases,
race conditions, and error-handling bugs introduced by this change.
```

Same failure/retry rules as Step 4.

---

### Step 6 — Acceptance criteria check

Run this step in parallel.

When a task brief exists, verify each criterion against the diff and tests:

| Criterion | Status                               | Evidence                |
| --------- | ------------------------------------ | ----------------------- |
| …         | met / partial / missing / untestable | file, test, or gap note |

If no brief was provided — ask the user to provide it via the
`AskQuestion` tool and wait for the answer.

---

### Step 7 — Optional quality gates

Run this step in parallel.

Read the linked skill and run **report-only** phases (never refactor without
user approval):

| Check               | Skill / action                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Complexity          | [check-complexity](../check-complexity/SKILL.md) — Phases 1–3 on diff scope                                               |
| Duplicates          | [check-duplicates](../check-duplicates/SKILL.md) — Phases 1–3 on diff scope                                               |
| NPM vulnerabilities | `npm audit --audit-level=moderate` in each package whose lockfile changed                                                 |
| Firestore rules     | [firebase-security-rules-auditor](../firebase/firebase-security-rules-auditor/SKILL.md) when rules or data access changed |
| ELEKS UI            | [use-eleks-ui](../use-eleks-ui/SKILL.md) — verify imports, tokens, component usage in changed client files                |

Keep optional sections brief — top findings only, not full duplicate skill output.

---

### Step 8 — Unified report

Return this structure to the user:

```markdown
## Review summary

**Scope:** <diff mode>, <N> files, packages: …
**Overall:** ready / needs work / blocked

### Coverage — <Strong | Normal | Weak>

<1–3 sentences + bullet list of gaps if any>

### Security — <N findings | none>

| Severity | Location | Finding |
| … | … | … |

### Defects — <N findings | none>

| Severity | Location | Finding |
| … | … | … |

### Acceptance criteria

| Criterion | Status | Notes |
| … | … | … |

### Optional checks

- Complexity: <summary or skipped>
- Duplicates: <summary or skipped>
- NPM audit: <summary or skipped>
- Firestore / ELEKS UI / error-handling: <summary or skipped>

### Recommended next steps

1. …
```

Sort finding tables by severity (highest first). Merge duplicate findings across
dimensions when the same root cause appears in security and Bugbot.

---

## Integration with implement

Typical sequence:

1. User runs **implement** → product code + test writers → Step 7 summary.
2. User runs **review** (or parent auto-suggests it in follow-ups).
3. User fixes findings → optional second review pass if requested.

When launching review from implement, pass in the Step 7 summary block as task
context (goal, acceptance criteria, test classification, key paths).

---

## Examples

### After simple UI label change

- Coverage: **skipped** — implement classified `tests: none`; verify justified.
- Security / Bugbot: run; usually clean.
- Optional: ELEKS UI only if imports/layout changed.

### After functions API + client UI

- Coverage: map handler tests + client specs + E2E; run both coverage commands.
- Security + Bugbot: parallel.
- Optional: Firestore rules if store touched; ELEKS UI for client.

### Empty diff

Stop at Step 1: "No changes to review."
