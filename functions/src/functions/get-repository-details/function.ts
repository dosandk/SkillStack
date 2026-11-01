import { z } from 'zod';

import {
  repositoriesStore,
  type RepositoryWithId,
  type SkillWithInstalls
} from '../../services/repositories-store';

const inputSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[^/]+$/)
});

export type RepositoryDetails = {
  repository: RepositoryWithId;
  skills: SkillWithInstalls[];
};

export async function getRepositoryDetails(
  input: unknown
): Promise<RepositoryDetails | null> {
  const { id } = inputSchema.parse(input);

  const [repository, skillDocuments] = await Promise.all([
    repositoriesStore.get(id),
    repositoriesStore.listSkills(id)
  ]);

  if (!repository) {
    return null;
  }

  const installCounts = new Map(
    skillDocuments.map(({ name, installCount }) => [name, installCount])
  );

  for (const name of repository.skills ?? []) {
    if (!installCounts.has(name)) {
      installCounts.set(name, 0);
    }
  }

  const skills = [...installCounts].map(([name, installCount]) => ({
    name,
    installCount
  }));

  skills.sort(
    (a, b) =>
      b.installCount - a.installCount || a.name.localeCompare(b.name, 'en')
  );

  return { repository, skills };
}
