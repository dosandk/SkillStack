// NOTE: mirrors the server's RepositoryWithId (functions/src/services/repositories-store.ts).
// The backend types are not shared — tsconfig.client.json excludes functions — so the shape
// is redeclared here. Fields other than `id` are read defensively since stored documents may
// be incomplete.
export interface RepositoryWithId {
  id: string;
  repoSlug: string;
  defaultBranch: string;
  owner: string;
  skills?: string[];
  totalInstalls?: number;
}
