import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BriefError,
  briefHash,
  buildBody,
  check,
  publish,
  validateBrief
} from './publish-task.mjs';

const brief = () => ({
  type: 'feature',
  title: 'Add multi-stage workflow',
  description: 'Why and what.',
  acceptance_criteria: ['It works', 'It is tested']
});

function fakeGh({ existing = [], failBoard = false } = {}) {
  const calls = [];
  const gh = (args, input) => {
    calls.push({ args, input });
    if (args[0] === 'issue' && args[1] === 'list') {
      return JSON.stringify(existing);
    }
    if (args[0] === 'issue' && args[1] === 'create') {
      return 'https://github.com/dosandk/SkillStack/issues/99\n';
    }
    if (failBoard) throw new Error('missing scope');
    return '';
  };
  return { gh, calls };
}

describe('validateBrief', () => {
  it('accepts a valid brief', () => {
    assert.deepEqual(validateBrief(brief()), []);
  });

  it('rejects non-objects', () => {
    assert.deepEqual(validateBrief(null), ['brief must be a JSON object']);
    assert.deepEqual(validateBrief([]), ['brief must be a JSON object']);
  });

  it('rejects unknown type, unknown field, and status', () => {
    const errors = validateBrief({
      ...brief(),
      type: 'chore',
      status: 'approved'
    });
    assert.ok(errors.some(e => e.startsWith('type must be')));
    assert.ok(errors.includes('unknown field "status"'));
  });

  it('rejects bad titles', () => {
    for (const title of [
      '',
      '  ',
      'Ends with dot.',
      'x'.repeat(71),
      ' padded '
    ]) {
      assert.ok(validateBrief({ ...brief(), title }).length > 0, title);
    }
  });

  it('rejects empty description and bad criteria', () => {
    assert.ok(validateBrief({ ...brief(), description: ' ' }).length > 0);
    for (const acceptance_criteria of [[], [''], 'text', Array(7).fill('x')]) {
      assert.ok(validateBrief({ ...brief(), acceptance_criteria }).length > 0);
    }
  });

  it('rejects secrets', () => {
    const description = `token ghp_${'a'.repeat(30)}`;
    assert.ok(
      validateBrief({ ...brief(), description }).includes(
        'brief appears to contain a secret'
      )
    );
  });
});

describe('briefHash', () => {
  it('is stable and changes with content', () => {
    assert.equal(briefHash(brief()), briefHash(brief()));
    assert.notEqual(
      briefHash(brief()),
      briefHash({ ...brief(), title: 'Other title' })
    );
  });
});

describe('buildBody', () => {
  it('renders description and checklist', () => {
    assert.equal(
      buildBody(brief()),
      '## Description\nWhy and what.\n\n## Acceptance criteria\n- [ ] It works\n- [ ] It is tested\n'
    );
  });
});

describe('check', () => {
  it('returns hash and label without side effects', () => {
    const { gh, calls } = fakeGh();
    const result = check(brief(), gh);
    assert.equal(result.label, 'enhancement');
    assert.equal(result.hash, briefHash(brief()));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].args[1], 'list');
  });

  it('fails on an exact-title duplicate, ignoring case', () => {
    const { gh } = fakeGh({
      existing: [
        {
          number: 5,
          title: 'add MULTI-stage workflow',
          url: 'u',
          state: 'OPEN'
        }
      ]
    });
    assert.throws(() => check(brief(), gh), /already exists: #5/);
  });

  it('ignores issues with merely similar titles', () => {
    const { gh } = fakeGh({
      existing: [{ number: 5, title: 'Add multi-stage workflow v2', url: 'u' }]
    });
    assert.doesNotThrow(() => check(brief(), gh));
  });

  it('fails on an invalid brief before calling gh', () => {
    const { gh, calls } = fakeGh();
    assert.throws(() => check({ ...brief(), title: '' }, gh), BriefError);
    assert.equal(calls.length, 0);
  });
});

describe('publish', () => {
  it('creates the issue and adds it to the board', () => {
    const { gh, calls } = fakeGh();
    const result = publish(brief(), briefHash(brief()), gh);
    assert.equal(result.url, 'https://github.com/dosandk/SkillStack/issues/99');

    const create = calls.find(c => c.args[1] === 'create');
    assert.ok(create.args.includes('--label'));
    assert.ok(!create.args.includes('--assignee'));
    assert.equal(create.input, buildBody(brief()));

    const add = calls.find(c => c.args[1] === 'item-add');
    assert.deepEqual(add.args, [
      'project',
      'item-add',
      '10',
      '--owner',
      'dosandk',
      '--url',
      'https://github.com/dosandk/SkillStack/issues/99'
    ]);
  });

  it('refuses a missing or mismatching approved hash', () => {
    for (const hash of [undefined, 'deadbeef0000']) {
      const { gh, calls } = fakeGh();
      assert.throws(
        () => publish(brief(), hash, gh),
        /differs from the approved/
      );
      assert.equal(calls.length, 0);
    }
  });

  it('refuses a brief edited after approval', () => {
    const approved = briefHash(brief());
    const { gh } = fakeGh();
    assert.throws(
      () => publish({ ...brief(), description: 'Changed' }, approved, gh),
      /differs from the approved/
    );
  });

  it('does not create when a duplicate exists', () => {
    const { gh, calls } = fakeGh({
      existing: [{ number: 5, title: brief().title, url: 'u' }]
    });
    assert.throws(
      () => publish(brief(), briefHash(brief()), gh),
      /already exists/
    );
    assert.ok(!calls.some(c => c.args[1] === 'create'));
  });

  it('reports the created issue when the board step fails', () => {
    const { gh } = fakeGh({ failBoard: true });
    assert.throws(
      () => publish(brief(), briefHash(brief()), gh),
      /issues\/99[\s\S]*do NOT create another issue/
    );
  });
});
