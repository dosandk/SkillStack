import type { ContentItem, ContentType } from '@shared';
import { FileContentRepository } from './file-repository';

/**
 * Storage-agnostic contract for reading catalog entries. The rest of the app
 * depends only on this interface — swapping the file store for MongoDB later
 * means writing a new implementation and changing the factory below, nothing else.
 */
export interface ContentRepository {
  list(type: ContentType): Promise<ContentItem[]>;
  get(type: ContentType, slug: string): Promise<ContentItem | null>;
}

/**
 * Returns the repository the app should use. Today it is always the markdown
 * file store; see wiki/adr/0002-file-based-content-db.md for the migration path.
 */
export function createContentRepository(): ContentRepository {
  return new FileContentRepository();
}

export { FileContentRepository } from './file-repository';
