// subagentStop hook: validates the Task Brief returned by `task-analyzer`.
// Read-only: never touches GitHub or project files. See
// .cursor/skills/create-github-task/reference.md ("Hook 1").
import { existsSync, readFileSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const AGENT_NAME = 'task-analyzer';
// The orchestrator puts this marker at the start of the Task description/prompt.
// `subagent_type` for custom agents is not documented, so it is not relied on alone.
export const AGENT_MARKER = '[task-analyzer]';
export const MAX_CORRECTIONS = 2;
// GitHub rejects issue titles longer than 256 characters.
export const MAX_TITLE_LENGTH = 256;
export const ISSUE_TYPES = ['enhancement', 'bug', 'documentation', 'hotfix'];

const MAX_TRANSCRIPT_BYTES = 2 * 1024 * 1024;
const BRIEF_FENCE = /```task-brief[^\S\r\n]*\r?\n([\s\S]*?)\r?\n[^\S\r\n]*```/g;

const isText = value => typeof value === 'string' && value.trim() !== '';
const isTextList = value => Array.isArray(value) && value.length > 0 && value.every(isText);

export function isTaskAnalyzer(input) {
  if (input?.subagent_type === AGENT_NAME) return true;
  return [input?.task, input?.description].some(
    value => typeof value === 'string' && value.trimStart().startsWith(AGENT_MARKER)
  );
}

/** Returns the JSON text of the LAST ```task-brief block, or null. */
export function extractBriefText(text) {
  if (typeof text !== 'string') return null;
  const blocks = [...text.matchAll(BRIEF_FENCE)];
  return blocks.length ? blocks[blocks.length - 1][1] : null;
}

/** Returns a list of problems; an empty list means the brief is valid. */
export function validateBrief(brief) {
  if (brief === null || typeof brief !== 'object' || Array.isArray(brief)) {
    return ['The brief must be a JSON object.'];
  }
  const errors = [];

  if (brief.status === 'NEEDS_CLARIFICATION') {
    if (!isTextList(brief.questions)) {
      errors.push('`questions` must be a non-empty array of non-empty strings.');
    }
    return errors;
  }

  if (brief.status !== 'READY') {
    return ['`status` must be "READY" or "NEEDS_CLARIFICATION".'];
  }
  if (!isText(brief.title)) {
    errors.push('`title` must be a non-empty string.');
  } else if (brief.title.trim().length > MAX_TITLE_LENGTH) {
    errors.push(`\`title\` must be at most ${MAX_TITLE_LENGTH} characters.`);
  }
  if (!ISSUE_TYPES.includes(brief.type)) {
    errors.push(`\`type\` must be one of: ${ISSUE_TYPES.join(', ')}.`);
  }
  if (!isText(brief.description)) errors.push('`description` must be a non-empty string.');

  if (brief.type === 'bug') {
    if (!isTextList(brief.stepsToReproduce)) {
      errors.push('`stepsToReproduce` must be a non-empty array of strings for a bug.');
    }
    if (!isText(brief.expected)) errors.push('`expected` must be a non-empty string for a bug.');
    if (!isText(brief.actual)) errors.push('`actual` must be a non-empty string for a bug.');
  } else if (!isTextList(brief.acceptanceCriteria)) {
    errors.push('`acceptanceCriteria` must be a non-empty array of non-empty strings.');
  }
  return errors;
}

function readTranscript(path) {
  try {
    if (typeof path !== 'string' || !existsSync(path)) return null;
    if (statSync(path).size > MAX_TRANSCRIPT_BYTES) return null;
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

/** Finds the brief in `summary`, falling back to the subagent transcript. */
function findBriefText(input) {
  return (
    extractBriefText(input.summary) ?? extractBriefText(readTranscript(input.agent_transcript_path))
  );
}

function checkInput(input) {
  const raw = findBriefText(input);
  if (raw === null) {
    return ['No ```task-brief fenced JSON block found in the final message.'];
  }
  try {
    return validateBrief(JSON.parse(raw));
  } catch (error) {
    return [`The task-brief block is not valid JSON (${error.message}).`];
  }
}

function buildFollowup(errors, attempt) {
  return [
    `Your Task Brief is invalid (correction ${attempt} of ${MAX_CORRECTIONS}):`,
    ...errors.map(error => `- ${error}`),
    'Return the full corrected result as exactly one ```task-brief JSON block at the end of',
    'your message. Do not invent requirements: if information is missing, return',
    'status NEEDS_CLARIFICATION with questions instead.'
  ].join('\n');
}

/** Pure decision function: hook input -> hook output. */
export function evaluate(input) {
  if (!isTaskAnalyzer(input)) return {};
  // Aborted/failed runs are never treated as success; the parent handles them.
  if (input.status !== 'completed') return {};

  const errors = checkInput(input);
  if (errors.length === 0) return {};

  const loopCount = Number.isInteger(input.loop_count) ? input.loop_count : 0;
  if (loopCount >= MAX_CORRECTIONS) return {}; // bounded: the parent reports the failure
  return { followup_message: buildFollowup(errors, loopCount + 1) };
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  let output = {};
  try {
    const text = (await readStdin()).replace(/^\uFEFF/, '').trim();
    output = evaluate(text ? JSON.parse(text) : {});
  } catch (error) {
    // Validation is advisory; the parent also self-checks. Never block on hook errors.
    process.stderr.write(`validate-task-handoff: ${error.message}\n`);
  }
  process.stdout.write(`${JSON.stringify(output)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
