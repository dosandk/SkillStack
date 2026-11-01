// Run: node --test .cursor/skills/create-github-task/hooks/guard-github-commands.spec.mjs
// Mock-only: classifies command strings and spawns the hook with JSON on stdin.
// Nothing here executes `gh`.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const HOOK = fileURLToPath(new URL('./guard-github-commands.mjs', import.meta.url));

function permissionOf(command) {
  const result = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ command, cwd: process.cwd() }),
    encoding: 'utf8'
  });
  assert.equal(result.status, 0);
  return JSON.parse(result.stdout);
}

test('plain read-only gh commands are allowed without a prompt', () => {
  const reads = [
    'gh auth status',
    'gh repo view dosandk/SkillStack --json viewerPermission',
    'gh issue list -R dosandk/SkillStack --search "category filters" --state open',
    'gh issue view 123 -R dosandk/SkillStack --json number,url,title,labels,assignees,projectItems',
    'gh label list -R dosandk/SkillStack --limit 100',
    'gh project view 10 --owner dosandk',
    'gh project item-list 10 --owner dosandk',
    'gh project field-list 10 --owner dosandk'
  ];
  for (const command of reads) assert.deepEqual(permissionOf(command), { permission: 'allow' }, command);
});

test('gh write commands ask for confirmation', () => {
  const writes = [
    'gh issue create -R dosandk/SkillStack --title "x" --body-file - --label bug',
    'gh issue edit 1 --add-label bug',
    'gh issue comment 1 --body hi',
    'gh label create bug -R dosandk/SkillStack',
    'gh label edit bug --color ff0000',
    'gh project item-add 10 --owner dosandk --url https://github.com/dosandk/SkillStack/issues/1',
    'gh project item-edit --id 1'
  ];
  for (const command of writes) {
    const out = permissionOf(command);
    assert.equal(out.permission, 'ask', command);
    assert.match(out.user_message, /Confirm this GitHub command/);
  }
});

test('destructive gh commands also ask (visible to the user, not silently allowed)', () => {
  for (const command of [
    'gh issue delete 1',
    'gh issue close 1',
    'gh label delete bug',
    'gh project item-delete 10 --id 1',
    'gh repo delete dosandk/SkillStack'
  ]) {
    assert.equal(permissionOf(command).permission, 'ask', command);
  }
});

test('mixed, chained, piped and substituted commands are never treated as read-only', () => {
  const tricky = [
    'gh issue list; gh issue create --title x',
    'gh issue list && gh issue create --title x',
    'gh issue list | gh issue create --title x',
    'gh issue list & gh issue close 1',
    'gh issue list\ngh issue create --title x',
    'echo $(gh issue create --title x)',
    'gh issue list `gh issue create`',
    'gh issue list > out.txt',
    'gh issue view $(gh issue create --title x)'
  ];
  for (const command of tricky) assert.equal(permissionOf(command).permission, 'ask', command);
});

test('indirect gh usage (api, alias, wrappers) is not allowed silently', () => {
  const indirect = [
    'gh api repos/dosandk/SkillStack/issues -X POST',
    'gh api graphql',
    'gh alias set x "issue create"',
    'powershell -Command "gh issue create --title x"',
    'cmd /c gh issue create --title x',
    'gh.exe issue create --title x',
    'GH issue create --title x',
    '& gh issue create --title x'
  ];
  for (const command of indirect) assert.equal(permissionOf(command).permission, 'ask', command);
});

test('gh invoked by path (absolute, relative, quoted) is not allowed silently', () => {
  const byPath = [
    'C:\\Program Files\\GitHub CLI\\gh.exe issue create --title x',
    '"C:\\Program Files\\GitHub CLI\\gh.exe" issue create --title x',
    '& "C:\\Program Files\\GitHub CLI\\gh.exe" issue close 1',
    './gh issue create --title x',
    '/usr/local/bin/gh issue create --title x',
    'C:\\tools\\gh.exe issue list'
  ];
  for (const command of byPath) assert.equal(permissionOf(command).permission, 'ask', command);
});

test('words that merely contain "gh" in a path segment stay unrelated', () => {
  const unrelated = ['ls gh-pages', 'cd docs/ghost', 'node scripts/ghost.mjs'];
  for (const command of unrelated) {
    assert.deepEqual(permissionOf(command), { permission: 'allow' }, command);
  }
});

test('unrelated commands are not affected', () => {
  for (const command of ['git status', 'npm run test:run', 'ls gh-pages', 'rg "ghost" .']) {
    assert.deepEqual(permissionOf(command), { permission: 'allow' }, command);
  }
});

test('bad input fails safe by asking, never by allowing', () => {
  for (const input of ['', 'not json', '{}', JSON.stringify({ command: 42 })]) {
    const result = spawnSync(process.execPath, [HOOK], { input, encoding: 'utf8' });
    assert.equal(result.status, 0);
    assert.equal(JSON.parse(result.stdout).permission, 'ask', input);
  }
});
