---
name: dotnet-code-review
description: >-
  Read-only, skeptical review of C#/.NET changes (git diff, branch or pull request):
  Standards and Spec review, correctness, async, EF Core, DI, security, tests and code
  smells. Reports Critical/High/Medium/Low findings with file:line and never edits code.
  Use when the user asks for a code review, PR review, or to "check my changes" in a
  C#/.NET project (.cs, ASP.NET Core).
---

# .NET code review

Mindset: polite but skeptical. Treat the PR description and issue as **claims to verify**, not
facts. Question whether the change is needed and whether the approach is the simplest one.

## Rules

- **Read-only.** Never modify source files, Git history, or remote resources (no commit, push,
  or writes to GitHub). Only report; offer fixes afterwards and apply them only if the user
  explicitly agrees. See "Execution safety" for build/test.
- Every finding needs evidence and a precise `file:line` plus a suggested fix. No evidence - no finding.
  - **Correctness, security, performance:** show a concrete failure scenario and the execution
    path that causes it.
  - **Standards, maintainability, smells:** name the violated rule or smell, explain its concrete
    maintenance impact, and recommend the smallest useful refactoring.
- **Scope: only what this PR changes.** Report only issues introduced by added, modified, or
  **deleted** lines in the change. Surrounding code is read for understanding, never reviewed.
  Never report unrelated pre-existing issues, old smells, or "while you're here" improvements.
  - For deleted-only changes (e.g. a removed `[Authorize]`, validation, or test), anchor the
    finding to the deleted line or diff hunk, using old-side line numbers when necessary.
  - Untouched code that the change breaks (collateral damage): anchor the finding to the changed
    line that causes it.
  - Skip what the compiler/analyzers/formatter/CI already catch.
- Repo rules (`.editorconfig`, `CLAUDE.md`, `.cursor/rules`) beat this skill.
- **Avoid false positives:** check the whole context (callers, wrappers) before claiming
  something is missing; skip theoretical risks; if unsure, put it under "Questions", not as a
  finding. Never claim an API "doesn't exist" or "is deprecated" from memory alone.
- **Don't pile on:** report a repeated issue once and list all affected files.
- Mark each finding as **blocker** (must fix before merge) or **advisory**.

## Steps

1. **Get the change** (read-only commands):
   - local: `git diff HEAD` + untracked files; branch: `git diff <base>...HEAD`
   - PR: `gh pr diff <n>` (read `gh pr view <n>` only at step 4)
   - Base branch: `git symbolic-ref --short refs/remotes/origin/HEAD` (fallback `develop`/`main`).
   - Ignore `bin/`, `obj/`, `*.g.cs`, `*.Designer.cs`, formatting-only changes.
   - Review changes that affect .NET application behavior:
     - C# source files and Razor components
     - project and solution configuration
     - dependencies and package versions (including lockfiles)
     - EF Core migrations and SQL scripts
     - application configuration and secrets
     - CI/CD and deployment configuration
     - tests and public API contracts
   - If no .NET-relevant changes exist, report that the skill is not applicable and stop.
2. **Read context to understand the diff (not to review it):** the whole changed method/class,
   callers of changed public members, sibling types with the same pattern, `Program.cs` (DI,
   auth, middleware), `DbContext`, recent `git log` of the file.
3. **Independent assessment** (before reading the PR text): what does the change do, why might
   it be needed, is the approach right, what could break for other callers (collateral damage)?
4. **Spec review:** now read the requirements (user text, PR description, GitHub Issue via
   branch name `feature/<n>-...` and `gh issue view <n>`). Reconcile with step 3. List each
   acceptance criterion as Met / Partial / Missing with evidence; flag scope creep. No spec
   found - say "Spec review skipped" and ask; never invent requirements.
5. **Standards review:** compare with project rules, then neighbouring code, then .NET
   conventions (naming, nullable, `async` + `CancellationToken`, logging templates, DTOs).
6. **Check the basics** (only added/modified/deleted lines, only areas the diff touches):
   - **Correctness:** wrong condition/operator, off-by-one, integer division, null handling
     (`!`, `FirstOrDefault`), `DateTime.Now`, `double` for money.
   - **Async/threads:** `async void`, `.Result`/`.Wait()`, missing `await`, ignored `CancellationToken`,
     shared mutable static state, one `DbContext` used in parallel.
   - **Performance/memory:** N+1, query without paging, `ToList()` before `Where`, multiple enumeration,
     undisposed `IDisposable`, `new HttpClient()` per call.
   - **ASP.NET Core / DI:** scoped service in singleton, missing registration, middleware order,
     logic in controllers, entities returned instead of DTOs, missing validation.
   - **EF Core:** raw SQL with string concatenation/interpolation, missing `AsNoTracking`, model
     change without migration, destructive migration.
   - **Security:** missing/overridden `[Authorize]`, no ownership check (IDOR), secrets in code,
     user input in SQL/paths/URLs, sensitive data in logs.
   - **API compatibility:** changed public signatures, routes, status codes, JSON shape, config keys.
   - **Errors:** empty `catch`, `throw ex;`, lost inner exception.
   - **Tests:** changed behavior without tests, tests with no assertions, `Skip`, `Thread.Sleep`.
   - **Leftovers:** `Console.WriteLine`, `TODO`, commented-out code, unrelated files or package /
     `TargetFramework` bumps.
7. **Code smells** (new code only, smallest refactoring, no rewrites): long method, duplication,
   magic numbers/strings, long parameter list, boolean flags, deep nesting, god class,
   speculative/dead code. Name the refactoring (e.g. Extract Method).
8. **Validation (optional):** follow "Execution safety" below; otherwise write "skipped".

## Execution safety

`dotnet build` writes artifacts and runs an implicit restore; `dotnet test` can run tests with
side effects. So:

- Never modify source files, Git history, or remote resources.
- Build and test commands are permitted only when execution is authorized and can be isolated
  safely.
- Prefer existing CI results when available.
- Never execute tests against production services.
- Report any skipped validation explicitly.

## Report

Use the user's language. Order findings by severity. Full example:
[examples/sample-report.md](examples/sample-report.md).

```markdown
## Code review: <scope> vs <base>
**Verdict:** ✅ Approve | ⚠️ Needs human review | ❌ Request changes
**Motivation / Approach:** <1-2 sentences: is the change justified, is the approach sound>
**Summary:** <2-3 sentences>   **Build/tests:** ✅ | ❌ | CI result | skipped (<reason>)

### Spec review
| # | Requirement | Status | Evidence |
Scope creep: ...

### Findings
#### 🔴 Critical / 🟠 High / 🟡 Medium / 🔵 Low
1. **[Category] Title** - `path/File.cs:42` (blocker | advisory)
   - **Problem:** <what and the failing scenario>
   - **Fix:** <minimal change>

### ❓ Questions (unverified)
```

Categories: Correctness, Async, Performance, ASP.NET, DI, EF Core, Security, API, Maintainability,
Testing, Standards, Spec, Smell. Omit empty sections.

**Severity**
- 🔴 **Critical:** security hole, data loss, secret in code, crash/deadlock on a common path, destructive migration.
- 🟠 **High:** likely bug, race, N+1/unbounded query, missing auth on a new endpoint, breaking API change,
  missing test for changed behavior, must-have requirement missing or contradicted.
- 🟡 **Medium:** edge-case bug, swallowed exception, inconsistency with project patterns, weak tests, scope creep.
- 🔵 **Low:** naming, leftovers, minor smells.

**Verdict:** the verdict must match the worst finding. Any Critical/High, or any blocker - Request
changes. Unsure, missing context, or code is correct but the approach is incomplete - Needs human
review. Never Approve when unsure or when a Medium finding is unresolved.

End with: "No files were changed. Tell me which fixes to apply."
