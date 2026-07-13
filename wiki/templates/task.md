---
id: SS-####
type: task
story: story/{story-id} (from story catalogue)
module: frontend | backend | cli | platform
status: draft → ready → in-progress → review → done
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# [Task Title]

## Summary

[One paragraph: what needs to be done, within this single module, and why.]

## Unit test requirements

- [Case internal to this module's own logic — no network/filesystem/other-module boundary]
- [Another case: edge conditions, error handling within the module]

## Integration test requirements

- [Case that crosses this module's boundary — e.g. call the Cloud Function against the
  Firestore emulator and assert on the written document; run the CLI command against a
  fixture repo and assert on installed files; render the component with a mocked API
  client and assert on displayed state]
- [Another boundary case, including the expected failure/negative behavior]

## Quality gates

- [ ] Unit test coverage ≥ 90% for changed code
- [ ] Integration tests cover every case listed above
- [ ] No new lint warnings
- [ ] Story's task table updated (status reflects this task)

## Related

- Story: `stories/{story-id}`
- Depends on: [other task IDs]
- Blocks: [other task IDs]
