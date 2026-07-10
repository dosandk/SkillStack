---
id: PROJ-####
type: story | task | bug | spike
feature: feature/{feature-id} (from feature catalogue)
status: draft → ready → in-progress → review → done
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# [Ticket Title]

## Summary

[One paragraph: what needs to be done and why]

## Acceptance criteria

### AC-1: [Golden path scenario]

**Given** [precondition with specific state]
**When** [specific user action with parameters]
**Then** [observable outcome with verifiable assertions]
**And** [side effect: database state, notification, audit log, etc.]

### AC-2: [Critical negative scenario]

**Given** [precondition]
**When** [action that should fail — invalid input, expired token, missing permission]
**Then** [specific error behavior: HTTP status, error message, UI feedback]
**And** [system state remains unchanged / rollback occurs]

### AC-3: [Permission boundary scenario]

**Given** [user with role X attempting action restricted to role Y]
**When** [the restricted action is attempted]
**Then** [access denied with appropriate feedback]
**And** [attempt is logged in audit trail]

## E2E test generation guidance

The three acceptance criteria above map directly to the minimum E2E coverage:

1. **Golden path** → happy-path E2E test
2. **Critical negative** → error-handling E2E test
3. **Permission boundary** → authorization E2E test

Additional E2E tests should be added for:

- Data edge cases mentioned in acceptance criteria
- Concurrent access scenarios (if applicable)
- Cross-feature interactions (if this ticket's feature depends on others)

## Quality gates

- [ ] Unit test coverage ≥ 90% for changed code
- [ ] Integration tests for all new/modified endpoints
- [ ] E2E tests: minimum 1 golden path + 1 critical negative + 1 permission boundary
- [ ] No new lint warnings
- [ ] Feature catalogue updated

## Related

- Feature: `features/{feature-id}`
- Depends on: [other ticket IDs]
- Blocks: [other ticket IDs]
