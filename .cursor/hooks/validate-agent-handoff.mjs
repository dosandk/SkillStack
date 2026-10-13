import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const HANDOFF_FIELDS = {
  spark: ['task', 'status', 'filesTouched', 'changes', 'checks', 'blockers'],
  octopus: [
    'task',
    'status',
    'packagesTouched',
    'filesTouched',
    'plan',
    'changes',
    'checks',
    'adrCandidates',
    'blockers'
  ]
};

const HANDOFF_STATUSES = new Set(['done', 'escalated']);

// NOTE: language tag is optional — unlabeled fences and ```handoff-json both count
const FENCED_JSON_BLOCK = /```(?:json|handoff-json)?\s*\n([\s\S]*?)```/g;

function jsonBodies(text) {
  if (typeof text !== 'string' || text.trim() === '') return [];

  const fenced = [...text.matchAll(FENCED_JSON_BLOCK)].map(match =>
    match[1].trim()
  );
  if (fenced.length > 0) return fenced;

  const trimmed = text.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return [];
  return [trimmed];
}

function subagentTranscriptPath(event) {
  if (
    typeof event.agent_transcript_path === 'string' &&
    event.agent_transcript_path !== ''
  ) {
    return event.agent_transcript_path;
  }

  // NOTE: subagentStop often leaves agent_transcript_path null; the file sits beside the parent transcript
  const childId = event.child_conversation_id;
  const parentTranscript = event.transcript_path;
  if (
    typeof childId !== 'string' ||
    !/^[A-Za-z0-9-]+$/.test(childId) ||
    typeof parentTranscript !== 'string' ||
    parentTranscript === ''
  ) {
    console.error(
      `No subagent transcript for ${event.subagent_type}: agent_transcript_path is empty and child_conversation_id or transcript_path is missing`
    );
    return null;
  }

  return join(dirname(parentTranscript), 'subagents', `${childId}.jsonl`);
}

function assistantTexts(record) {
  const content = record?.message?.content;
  if (!Array.isArray(content)) return [];

  return content
    .filter(
      block =>
        block !== null &&
        typeof block === 'object' &&
        block.type === 'text' &&
        typeof block.text === 'string'
    )
    .map(block => block.text);
}

function handoffTextFromTranscript(path) {
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (error) {
    console.error(`Failed to read subagent transcript ${path}:`, error);
    return '';
  }

  const texts = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '') continue;

    let record;
    try {
      record = JSON.parse(trimmed);
    } catch (error) {
      console.error(
        `Failed to parse subagent transcript line in ${path}:`,
        error
      );
      continue;
    }

    if (record?.role === 'assistant') texts.push(...assistantTexts(record));
  }

  const decoded = [...texts]
    .reverse()
    .find(text => jsonBodies(text).length === 1);
  if (decoded) return decoded;

  return jsonBodies(raw).length === 1 ? raw : '';
}

function loadHandoff(event) {
  let text = event.summary;

  if (jsonBodies(text).length === 0) {
    const path = subagentTranscriptPath(event);
    if (path) text = handoffTextFromTranscript(path);
  }

  const bodies = jsonBodies(text);
  if (bodies.length !== 1) {
    return { problems: [`expected one JSON object, found ${bodies.length}`] };
  }

  try {
    const handoff = JSON.parse(bodies[0]);
    if (
      handoff === null ||
      typeof handoff !== 'object' ||
      Array.isArray(handoff)
    ) {
      return { problems: ['result must be a JSON object'] };
    }
    return { handoff };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { problems: [`JSON is invalid: ${message}`] };
  }
}

function missingRequiredFields(agent, handoff) {
  const missing = HANDOFF_FIELDS[agent].filter(
    field => handoff[field] === undefined
  );
  return missing.length > 0 ? `missing ${missing.join(', ')}` : null;
}

function unknownStatus(handoff) {
  return HANDOFF_STATUSES.has(handoff.status)
    ? null
    : 'status must be done or escalated';
}

function blockersOnDone(handoff) {
  const hasBlockers =
    Array.isArray(handoff.blockers) && handoff.blockers.length > 0;
  if (handoff.status !== 'done' || !hasBlockers) return null;
  return 'blockers must be empty when status is done';
}

function blockersOnEscalated(handoff) {
  const hasBlockers =
    Array.isArray(handoff.blockers) && handoff.blockers.length > 0;
  if (handoff.status !== 'escalated' || hasBlockers) return null;
  return 'blockers must contain at least one item when status is escalated';
}

function packagesTouchedRequired(agent, handoff) {
  const hasPackages =
    Array.isArray(handoff.packagesTouched) &&
    handoff.packagesTouched.length > 0;
  if (agent !== 'octopus' || hasPackages) return null;
  return 'packagesTouched must contain at least one item';
}

function validate(agent, handoff) {
  return [
    missingRequiredFields(agent, handoff),
    unknownStatus(handoff),
    blockersOnDone(handoff),
    blockersOnEscalated(handoff),
    packagesTouchedRequired(agent, handoff)
  ].filter(message => message !== null);
}

function followupPayload(problems) {
  return {
    followup_message: [
      'The result JSON is missing or invalid.',
      '',
      problems.map(problem => `- ${problem}`).join('\n'),
      '',
      'Re-emit only the JSON object with those fields corrected.',
      'Report the existing outcome truthfully. Do not make additional source changes solely to correct the result.'
    ].join('\n')
  };
}

function run() {
  let payload = {};
  let event;

  try {
    event = JSON.parse(readFileSync(0, 'utf8'));
  } catch (error) {
    console.error('Failed to parse the subagentStop hook input:', error);
    process.stdout.write(`${JSON.stringify(payload)}\n`);
    return;
  }

  const isEvent =
    event !== null && typeof event === 'object' && !Array.isArray(event);
  const shouldValidate =
    isEvent &&
    event.status === 'completed' &&
    Object.hasOwn(HANDOFF_FIELDS, event.subagent_type);

  if (shouldValidate) {
    const loaded = loadHandoff(event);
    const problems =
      loaded.problems ?? validate(event.subagent_type, loaded.handoff);
    if (problems.length > 0) payload = followupPayload(problems);
  }

  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

run();
