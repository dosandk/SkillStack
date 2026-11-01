// Run: node --test .cursor/skills/create-github-task/hooks/validate-task-handoff.spec.mjs
// Mock-only: spawns the hook with JSON on stdin. No GitHub access of any kind.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const HOOK = fileURLToPath(new URL('./validate-task-handoff.mjs', import.meta.url));

const block = value => `Summary text.\n\n\`\`\`task-brief\n${JSON.stringify(value, null, 2)}\n\`\`\`\n`;

const READY = {
  status: 'READY',
  type: 'enhancement',
  title: 'Add category filters to skill search',
  description: 'Allow users to filter skills by category.',
  acceptanceCriteria: ['Users can select a category', 'Results reflect the category']
};
const BUG = {
  status: 'READY',
  type: 'bug',
  title: 'Fix crash on empty search',
  description: 'Search crashes.',
  stepsToReproduce: ['Open search', 'Submit empty query'],
  expected: 'Empty state is shown',
  actual: 'Page crashes'
};
const CLARIFY = { status: 'NEEDS_CLARIFICATION', questions: ['Which categories?'] };

const hookInput = (overrides = {}) => ({
  hook_event_name: 'subagentStop',
  subagent_type: 'task-analyzer',
  status: 'completed',
  task: 'Analyze: add category filters',
  description: 'Analyze task',
  summary: block(READY),
  loop_count: 0,
  ...overrides
});

function run(input, raw) {
  const result = spawnSync(process.execPath, [HOOK], {
    input: raw ?? JSON.stringify(input),
    encoding: 'utf8'
  });
  return { code: result.status, out: JSON.parse(result.stdout), err: result.stderr };
}

test('valid READY brief: no follow-up', () => {
  const { code, out } = run(hookInput());
  assert.equal(code, 0);
  assert.deepEqual(out, {});
});

test('valid bug brief and NEEDS_CLARIFICATION: no follow-up', () => {
  assert.deepEqual(run(hookInput({ summary: block(BUG) })).out, {});
  assert.deepEqual(run(hookInput({ summary: block(CLARIFY) })).out, {});
});

test('missing title: follow-up asks for a corrected brief', () => {
  const noTitle = { ...READY, title: undefined };
  const { out } = run(hookInput({ summary: block(noTitle) }));
  assert.match(out.followup_message, /`title`/);
  assert.match(out.followup_message, /correction 1 of 2/);
});

test('title longer than 256 characters is invalid; 256 is accepted', () => {
  const tooLong = { ...READY, title: 'x'.repeat(257) };
  assert.match(run(hookInput({ summary: block(tooLong) })).out.followup_message, /at most 256/);
  const maxLen = { ...READY, title: 'x'.repeat(256) };
  assert.deepEqual(run(hookInput({ summary: block(maxLen) })).out, {});
});

test('invalid type, empty description, empty criteria: all reported', () => {
  const broken = { ...READY, type: 'chore', description: ' ', acceptanceCriteria: [] };
  const { out } = run(hookInput({ summary: block(broken) }));
  assert.match(out.followup_message, /`type`/);
  assert.match(out.followup_message, /`description`/);
  assert.match(out.followup_message, /`acceptanceCriteria`/);
});

test('bug without reproduction details and clarification without questions are invalid', () => {
  const badBug = { ...BUG, stepsToReproduce: [] };
  assert.match(run(hookInput({ summary: block(badBug) })).out.followup_message, /stepsToReproduce/);
  const noQuestions = { status: 'NEEDS_CLARIFICATION', questions: [] };
  assert.match(run(hookInput({ summary: block(noQuestions) })).out.followup_message, /`questions`/);
});

test('unknown status, prose only and malformed JSON are invalid', () => {
  assert.match(run(hookInput({ summary: block({ status: 'MAYBE' }) })).out.followup_message, /status/);
  assert.match(run(hookInput({ summary: 'Looks READY to me!' })).out.followup_message, /No ```task-brief/);
  const malformed = 'x\n```task-brief\n{ "status": "READY", \n```\n';
  assert.match(run(hookInput({ summary: malformed })).out.followup_message, /not valid JSON/);
});

test('corrections are bounded to two', () => {
  const bad = hookInput({ summary: 'no block' });
  assert.ok(run({ ...bad, loop_count: 0 }).out.followup_message);
  assert.ok(run({ ...bad, loop_count: 1 }).out.followup_message);
  assert.deepEqual(run({ ...bad, loop_count: 2 }).out, {});
});

test('last task-brief block wins', () => {
  const summary = `${block({ status: 'READY' })}\nCorrected:\n${block(READY)}`;
  assert.deepEqual(run(hookInput({ summary })).out, {});
});

test('falls back to the agent transcript when the summary has no block', () => {
  const dir = mkdtempSync(join(tmpdir(), 'handoff-'));
  try {
    const path = join(dir, 'transcript.txt');
    writeFileSync(path, block(READY));
    const { out } = run(hookInput({ summary: 'short summary', agent_transcript_path: path }));
    assert.deepEqual(out, {});
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('identifies the agent by marker when subagent_type is generic', () => {
  const generic = { subagent_type: 'generalPurpose', summary: 'no block' };
  assert.deepEqual(run(hookInput({ ...generic, task: 'Analyze: x' })).out, {});
  const marked = hookInput({ ...generic, task: '[task-analyzer] Analyze: x' });
  assert.ok(run(marked).out.followup_message);
});

test('unrelated subagents are ignored', () => {
  assert.deepEqual(run(hookInput({ subagent_type: 'explore', summary: 'anything' })).out, {});
});

test('error and aborted runs are not validated or retried', () => {
  assert.deepEqual(run(hookInput({ status: 'error', summary: 'boom' })).out, {});
  assert.deepEqual(run(hookInput({ status: 'aborted', summary: '' })).out, {});
});

test('bad stdin never crashes or blocks', () => {
  const empty = run(null, '');
  assert.equal(empty.code, 0);
  assert.deepEqual(empty.out, {});
  const garbage = run(null, 'not json');
  assert.equal(garbage.code, 0);
  assert.deepEqual(garbage.out, {});
  assert.match(garbage.err, /validate-task-handoff/);
});
