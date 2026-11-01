import { useEffect, useMemo, useState } from 'react';

import type { RepositorySkill, RepositoryWithId } from '@shared';

import { fetchRepositoryDetails, fetchSkillDescriptions } from '../lib/api';

export type RepositoryDetailsStatus =
  | 'loading'
  | 'ready'
  | 'not-found'
  | 'error';

export type SkillWithDescription = RepositorySkill & { description?: string };

interface UseRepositoryDetailsResult {
  status: RepositoryDetailsStatus;
  repository: RepositoryWithId | null;
  skills: SkillWithDescription[];
}

interface LoadedState {
  id: string;
  status: Exclude<RepositoryDetailsStatus, 'loading'>;
  repository: RepositoryWithId | null;
  skills: RepositorySkill[];
  descriptions: Record<string, string>;
}

export function useRepositoryDetails(id: string): UseRepositoryDetailsResult {
  const [loaded, setLoaded] = useState<LoadedState | null>(null);

  useEffect(() => {
    let isActive = true;

    const finish = (state: Omit<LoadedState, 'id' | 'descriptions'>) =>
      setLoaded({ id, descriptions: {}, ...state });

    const mergeDescriptions = (descriptions: Record<string, string>) => {
      if (isActive) {
        setLoaded(current =>
          current?.id === id ? { ...current, descriptions } : current
        );
      }
    };

    fetchRepositoryDetails(id)
      .then(details => {
        if (!isActive) {
          return;
        }

        if (!details) {
          finish({ status: 'not-found', repository: null, skills: [] });

          return;
        }

        const { repository, skills } = details;

        finish({ status: 'ready', repository, skills });

        // NOTE: descriptions are best effort and never change the status
        return fetchSkillDescriptions(
          repository,
          skills.map(skill => skill.name)
        ).then(mergeDescriptions);
      })
      .catch(() => {
        if (isActive) {
          finish({ status: 'error', repository: null, skills: [] });
        }
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  const current = loaded?.id === id ? loaded : null;

  const skills = useMemo(
    () =>
      (current?.skills ?? []).map(skill => ({
        ...skill,
        description: current?.descriptions[skill.name]
      })),
    [current]
  );

  return {
    status: current?.status ?? 'loading',
    repository: current?.repository ?? null,
    skills
  };
}
