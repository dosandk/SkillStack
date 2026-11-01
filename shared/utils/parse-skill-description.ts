const FRONTMATTER_DELIMITER = '---';
const DESCRIPTION_KEY = /^description:(.*)$/;
const BLOCK_SCALAR_INDICATOR = /^([>|])[+-]?\d*$/;

const isIndentedOrBlank = (line: string): boolean =>
  line.trim() === '' || /^\s/.test(line);

const unquote = (value: string): string => {
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replaceAll("''", "'");
  }

  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\(["\\])/g, '$1');
  }

  return value;
};

const readFrontmatter = (markdown: string): string[] | undefined => {
  const lines = markdown.replace(/^\uFEFF/, '').split(/\r?\n/);

  if (lines[0]?.trimEnd() !== FRONTMATTER_DELIMITER) {
    return undefined;
  }

  const end = lines.findIndex(
    (line, index) => index > 0 && line.trimEnd() === FRONTMATTER_DELIMITER
  );

  return end === -1 ? undefined : lines.slice(1, end);
};

/**
 * Reads the `description` of a skill file from its frontmatter: plain, quoted,
 * folded (`>`) and literal (`|`) values, with indented continuation lines.
 * The body of the file is never read.
 */
export function parseSkillDescription(markdown: string): string | undefined {
  const frontmatter = readFrontmatter(markdown);

  if (!frontmatter) {
    return undefined;
  }

  const start = frontmatter.findIndex(line => DESCRIPTION_KEY.test(line));

  if (start === -1) {
    return undefined;
  }

  const value = (frontmatter[start].match(DESCRIPTION_KEY)?.[1] ?? '').trim();

  const continuation: string[] = [];

  for (const line of frontmatter.slice(start + 1)) {
    if (!isIndentedOrBlank(line)) {
      break;
    }

    continuation.push(line);
  }

  const block = value.match(BLOCK_SCALAR_INDICATOR);
  let description: string;

  if (block) {
    const lines = continuation.map(line => line.trim());

    description =
      block[1] === '|'
        ? lines.join('\n')
        : lines.filter(line => line !== '').join(' ');
  } else {
    const parts = [value, ...continuation.map(line => line.trim())];

    description = unquote(parts.filter(part => part !== '').join(' '));
  }

  return description.trim() || undefined;
}
