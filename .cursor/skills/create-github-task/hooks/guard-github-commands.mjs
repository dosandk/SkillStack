// beforeShellExecution hook: asks for confirmation before any `gh` command that is not a
// plain read-only one. It is defense in depth only; it never counts as workflow approval.
// See .cursor/skills/create-github-task/reference.md ("Hook 2").
import { pathToFileURL } from 'node:url';

// A `gh` token anywhere in the command (also inside wrappers, quotes, chains or behind a
// path such as `C:\Program Files\GitHub CLI\gh.exe` or `./gh`).
const GH_TOKEN = /(^|[\s;&|(`"'\\/])gh(\.exe)?(?=$|[\s;&|)`"'])/i;
// Anything that can chain, redirect, substitute or expand. Such commands are never "plain".
const SHELL_SYNTAX = /[;&|<>`$(){}^\r\n]/;
// Plain read-only commands: `gh <group> <action> [args]`.
const READ_ONLY = /^gh(\.exe)?\s+(auth\s+status|repo\s+view|issue\s+(list|view)|label\s+list|project\s+(view|item-list|field-list))(\s|$)/i;

export const MESSAGE =
  'Confirm this GitHub command. This prompt does not replace approval of the full issue draft.';

export const KIND = Object.freeze({
  UNRELATED: 'unrelated',
  READ: 'read',
  WRITE_OR_UNKNOWN: 'write-or-unknown'
});

// Only these kinds are allowed silently; everything else asks.
const SILENT_KINDS = new Set([KIND.UNRELATED, KIND.READ]);

export function classify(command) {
  if (typeof command !== 'string') return KIND.WRITE_OR_UNKNOWN;
  if (!GH_TOKEN.test(command)) return KIND.UNRELATED;
  const plain = command.trim();
  if (!SHELL_SYNTAX.test(plain) && READ_ONLY.test(plain)) return KIND.READ;
  return KIND.WRITE_OR_UNKNOWN;
}

export function evaluate(input) {
  if (SILENT_KINDS.has(classify(input?.command))) return { permission: 'allow' };
  return { permission: 'ask', user_message: MESSAGE, agent_message: MESSAGE };
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  let output;
  try {
    const text = (await readStdin()).replace(/^\uFEFF/, '').trim();
    output = evaluate(JSON.parse(text));
  } catch (error) {
    // Cannot classify: fail safe by asking, never by allowing.
    process.stderr.write(`guard-github-commands: ${error.message}\n`);
    output = { permission: 'ask', user_message: MESSAGE, agent_message: MESSAGE };
  }
  process.stdout.write(`${JSON.stringify(output)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
