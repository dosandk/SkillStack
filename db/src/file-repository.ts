import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import matter from 'gray-matter';

import type { ContentItem, ContentType } from '@shared';
import { schemaFor } from '@shared';
import type { ContentRepository } from './index';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// db/src/file-repository.ts -> db/content
const DEFAULT_CONTENT_ROOT = path.resolve(__dirname, '..', 'content');

type ContentIndex = Record<ContentType, Record<string, string>>;

/**
 * Reads catalog entries from markdown files: `db/content/<type>/<slug>.md`.
 * File locations are resolved via `db/content/index.json` (slug → relative path),
 * so `get()` jumps directly to the target file without scanning the directory.
 * Frontmatter is parsed with gray-matter and validated against the matching
 * zod schema from @shared, so a malformed file fails loudly at read time.
 */
export class FileContentRepository implements ContentRepository {
  private readonly contentRoot: string;

  constructor(contentRoot: string = DEFAULT_CONTENT_ROOT) {
    this.contentRoot = contentRoot;
  }

  async list(type: ContentType): Promise<ContentItem[]> {
    const index = await this.loadIndex();
    const entries = Object.entries(index[type] ?? {});

    const items = await Promise.all(
      entries.map(([slug, relativePath]) =>
        this.parseFile(type, slug, path.join(this.contentRoot, relativePath))
      )
    );
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  async get(type: ContentType, slug: string): Promise<ContentItem | null> {
    const index = await this.loadIndex();
    const relativePath = index[type]?.[slug];
    if (!relativePath) return null;
    return this.parseFile(
      type,
      slug,
      path.join(this.contentRoot, relativePath)
    );
  }

  private async loadIndex(): Promise<ContentIndex> {
    const raw = await readFile(
      path.join(this.contentRoot, 'index.json'),
      'utf8'
    );
    return JSON.parse(raw) as ContentIndex;
  }

  private async parseFile(
    type: ContentType,
    slug: string,
    filePath: string
  ): Promise<ContentItem> {
    const raw = await readFile(filePath, 'utf8');
    const { data, content } = matter(raw);

    const schema = schemaFor(type);
    const result = schema.safeParse({
      slug,
      ...data,
      type,
      content: content.trim()
    });

    if (!result.success) {
      throw new Error(
        `Invalid ${type} frontmatter in ${filePath}:\n${result.error.message}`
      );
    }
    return result.data as ContentItem;
  }
}
