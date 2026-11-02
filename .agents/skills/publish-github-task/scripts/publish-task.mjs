#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const REPO = 'dosandk/SkillStack';
export const PROJECT = { number: '10', owner: 'dosandk' };

const TYPE_LABELS = {
  bug: 'bug',
  feature: 'enhancement',
  docs: 'documentation'
};
const FIELDS = ['type', 'title', 'description', 'acceptance_criteria'];
const MAX_TITLE = 70;
const MAX_CRITERIA = 6;
const SECRET_PATTERN =
  /(gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;

export class BriefError extends Error {}

export function validateBrief(brief) {
  const errors = [];
  if (brief === null || typeof brief !== 'object' || Array.isArray(brief)) {
    return ['brief must be a JSON object'];
  }

  for (const key of Object.keys(brief)) {
    if (!FIELDS.includes(key)) errors.push(`unknown field "${key}"`);
  }
  if (!Object.hasOwn(TYPE_LABELS, brief.type)) {
    errors.push(`type must be one of: ${Object.keys(TYPE_LABELS).join(', ')}`);
  }

  const { title, description, acceptance_criteria: criteria } = brief;
  if (typeof title !== 'string' || title.trim() === '') {
    errors.push('title must be a non-empty string');
  } else {
    if (title.length > MAX_TITLE) {
      errors.push(`title must be at most ${MAX_TITLE} characters`);
    }
    if (title.endsWith('.')) errors.push('title must not end with a period');
    if (title !== title.trim() || /\n/.test(title)) {
      errors.push('title must be a single trimmed line');
    }
  }
  if (typeof description !== 'string' || description.trim() === '') {
    errors.push('description must be a non-empty string');
  }
  if (
    !Array.isArray(criteria) ||
    criteria.length < 1 ||
    criteria.length > MAX_CRITERIA ||
    criteria.some(item => typeof item !== 'string' || item.trim() === '')
  ) {
    errors.push(
      `acceptance_criteria must be 1-${MAX_CRITERIA} non-empty strings`
    );
  }

  if (SECRET_PATTERN.test(JSON.stringify(brief))) {
    errors.push('brief appears to contain a secret');
  }
  return errors;
}

export function briefHash(brief) {
  const canonical = JSON.stringify(FIELDS.map(key => [key, brief[key]]));
  return createHash('sha256').update(canonical).digest('hex').slice(0, 12);
}

export function buildBody(brief) {
  const criteria = brief.acceptance_criteria
    .map(item => `- [ ] ${item}`)
    .join('\n');
  return `## Description\n${brief.description}\n\n## Acceptance criteria\n${criteria}\n`;
}

export function runGh(args, input) {
  return execFileSync('gh', args, { encoding: 'utf8', input });
}

export function findDuplicates(brief, gh = runGh) {
  const output = gh([
    'issue',
    'list',
    '-R',
    REPO,
    '--state',
    'all',
    '--search',
    `${brief.title} in:title`,
    '--json',
    'number,title,url,state'
  ]);
  const wanted = brief.title.trim().toLowerCase();
  return JSON.parse(output).filter(
    issue => issue.title.trim().toLowerCase() === wanted
  );
}

function assertValid(brief) {
  const errors = validateBrief(brief);
  if (errors.length > 0) {
    throw new BriefError(`invalid brief:\n- ${errors.join('\n- ')}`);
  }
}

function assertNoDuplicates(brief, gh) {
  const duplicates = findDuplicates(brief, gh);
  if (duplicates.length > 0) {
    const list = duplicates.map(i => `#${i.number} ${i.url}`).join(', ');
    throw new BriefError(`issue with this title already exists: ${list}`);
  }
}

export function check(brief, gh = runGh) {
  assertValid(brief);
  assertNoDuplicates(brief, gh);
  return { hash: briefHash(brief), label: TYPE_LABELS[brief.type] };
}

export function publish(brief, approvedHash, gh = runGh) {
  assertValid(brief);
  if (approvedHash !== briefHash(brief)) {
    throw new BriefError(
      'brief differs from the approved one: run check again and get new approval'
    );
  }
  assertNoDuplicates(brief, gh);

  const url = gh(
    [
      'issue',
      'create',
      '-R',
      REPO,
      '--title',
      brief.title,
      '--body-file',
      '-',
      '--label',
      TYPE_LABELS[brief.type]
    ],
    buildBody(brief)
  ).trim();

  try {
    gh([
      'project',
      'item-add',
      PROJECT.number,
      '--owner',
      PROJECT.owner,
      '--url',
      url
    ]);
  } catch (error) {
    throw new BriefError(
      `issue created: ${url}\nadding to project ${PROJECT.number} failed: ${error.message}\n` +
        `do NOT create another issue; retry: gh project item-add ${PROJECT.number} --owner ${PROJECT.owner} --url ${url}`
    );
  }
  return { url };
}

function main(argv) {
  const [command, file, flag, approvedHash] = argv;
  if (!['check', 'publish'].includes(command) || !file) {
    throw new BriefError(
      'usage: publish-task.mjs check <brief.json>\n' +
        '       publish-task.mjs publish <brief.json> --approved-hash <hash>'
    );
  }
  let brief;
  try {
    brief = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new BriefError(`cannot read brief: ${error.message}`);
  }

  if (command === 'check') {
    const { hash, label } = check(brief);
    console.log(`OK label=${label} hash=${hash}`);
    return;
  }
  if (flag !== '--approved-hash' || !approvedHash) {
    throw new BriefError('publish requires --approved-hash <hash>');
  }
  console.log(`CREATED ${publish(brief, approvedHash).url}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof BriefError ? error.message : error);
    process.exit(1);
  }
}
