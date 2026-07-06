import { z } from 'zod';

/**
 * The four kinds of catalog entries SkillStack hosts. Each one is a markdown
 * file whose frontmatter is validated against the matching schema below.
 */
export const CONTENT_TYPES = ['skill', 'rule', 'mcp', 'agent'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const contentTypeSchema = z.enum(CONTENT_TYPES);

/**
 * Fields shared by every catalog entry — modelled on the skills.sh entry page
 * (name, description, owner, tags, ...). `content` is the markdown body and is
 * filled in by the db layer, not the frontmatter.
 */
export const baseContentSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  type: contentTypeSchema,
  tags: z.array(z.string()).default([]),
  agents: z.array(z.string()).default([]),
  installs: z.number().default(0),
  audit: z.enum(['audited', 'pending', 'none']).default('none'),
  author: z.string().min(1),
  // ISO date string. YAML parses an unquoted `2026-01-15` as a Date, so
  // normalize that back to a YYYY-MM-DD string before validating.
  createdAt: z.preprocess(
    v => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
    z.string().min(1)
  ),
  content: z.string().default('') // markdown body, injected by the repository
});

export const skillSchema = baseContentSchema.extend({
  type: z.literal('skill'),
  // How a consumer installs / adds the skill (e.g. a CLI command).
  install: z.string().optional()
});

export const ruleSchema = baseContentSchema.extend({
  type: z.literal('rule'),
  // Glob(s) the rule applies to, e.g. "src/**/*.tsx".
  appliesTo: z.array(z.string()).default([])
});

export const mcpSchema = baseContentSchema.extend({
  type: z.literal('mcp'),
  // MCP server command/url and how it is transported.
  server: z.string().optional(),
  transport: z.enum(['stdio', 'sse', 'http']).optional()
});

export const agentSchema = baseContentSchema.extend({
  type: z.literal('agent'),
  model: z.string().optional(),
  tools: z.array(z.string()).default([])
});

export type Skill = z.infer<typeof skillSchema>;
export type Rule = z.infer<typeof ruleSchema>;
export type Mcp = z.infer<typeof mcpSchema>;
export type Agent = z.infer<typeof agentSchema>;

/** Any catalog entry, discriminated by `type`. */
export type ContentItem = Skill | Rule | Mcp | Agent;

const SCHEMA_BY_TYPE = {
  skill: skillSchema,
  rule: ruleSchema,
  mcp: mcpSchema,
  agent: agentSchema
} as const;

/** Returns the zod schema for a given content type. */
export function schemaFor(type: ContentType) {
  return SCHEMA_BY_TYPE[type];
}

/** Type guard for narrowing an arbitrary string to a known content type. */
export function isContentType(value: string): value is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(value);
}

/**
 * Plural form used in API routes and on-disk folder names (skill -> skills).
 * Single source of truth so the server, db, and client agree.
 */
export const CONTENT_TYPE_PLURAL: Record<ContentType, string> = {
  skill: 'skills',
  rule: 'rules',
  mcp: 'mcps',
  agent: 'agents'
};

const TYPE_BY_PLURAL: Record<string, ContentType> = Object.fromEntries(
  CONTENT_TYPES.map(type => [CONTENT_TYPE_PLURAL[type], type])
);

/** Resolves a plural route/folder segment to its content type, or null. */
export function contentTypeFromPlural(plural: string): ContentType | null {
  return TYPE_BY_PLURAL[plural] ?? null;
}

/** Returns the plural form of a content type (e.g. 'skill' -> 'skills'). */
export function pluralOf(type: ContentType): string {
  return CONTENT_TYPE_PLURAL[type];
}
