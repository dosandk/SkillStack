// NOTE: mirrors the server's favorites/share contract (functions/src/functions/get-favorites
// and functions/src/functions/get-shared-collection). Redeclared locally since backend types
// aren't shared with the client build (see client/src/types/repository.ts for the same pattern).
export interface FavoriteRepoEntry {
  repoId: string;
  repoSlug: string;
  owner: string;
  all: boolean;
  skills: string[];
}

export interface SharedCollectionEntry {
  repoId: string;
  repoSlug: string;
  owner: string;
  defaultBranch: string;
  skills: string[] | 'all';
}

export interface SharedCollectionResponse {
  shareId: string;
  ownerId: string;
  createdAt: string;
  entries: SharedCollectionEntry[];
}
