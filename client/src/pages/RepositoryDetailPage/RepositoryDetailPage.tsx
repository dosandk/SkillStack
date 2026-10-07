import { useParams } from 'react-router-dom';
import {
  Container,
  ErrorState,
  Heading,
  List,
  ListItem,
  ListItemText,
  NoDataState,
  Page404State,
  Skeleton,
  Stack
} from '@eleks-ui/components';

import { FavoriteToggle } from '../../components/FavoriteToggle/FavoriteToggle';
import { useFavorites } from '../../hooks/useFavorites';
import { useRepositories } from '../../hooks/useRepositories';

export function RepositoryDetailPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const { repositories, isLoading, error } = useRepositories();
  const { favorites, addRepoFavorite, addSkillFavorite, removeFavorite } =
    useFavorites();

  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Stack alignItems="center" sx={{ py: 6 }}>
          <ErrorState description="Could not load this repository. Please try again later." />
        </Stack>
      </Container>
    );
  }

  const repository = repositories.find(candidate => candidate.id === repoId);

  if (!repository) {
    return (
      <Container sx={{ py: 4 }}>
        <Stack alignItems="center" sx={{ py: 6 }}>
          <Page404State description="This repository could not be found." />
        </Stack>
      </Container>
    );
  }

  const skills = repository.skills ?? [];
  const favoriteEntry = favorites.find(entry => entry.repoId === repository.id);
  const isRepoFavorited = favoriteEntry?.all ?? false;
  const favoritedSkills = new Set(favoriteEntry?.skills ?? []);

  return (
    <Container sx={{ py: 4 }}>
      <Heading
        variant="page"
        title={repository.repoSlug}
        subtitle={`${skills.length} skill(s) — maintained by ${repository.owner}`}
        actions={
          <FavoriteToggle
            isFavorited={isRepoFavorited}
            label={
              isRepoFavorited
                ? `Remove ${repository.repoSlug} from favorites`
                : `Favorite whole repository ${repository.repoSlug}`
            }
            onToggle={() =>
              isRepoFavorited
                ? removeFavorite(repository.id)
                : addRepoFavorite(repository.id)
            }
          />
        }
        divider
      />

      {skills.length === 0 && <NoDataState />}

      {skills.length > 0 && (
        <List data-testid="repository-skill-list">
          {skills.map(skill => {
            const isSkillFavorited =
              isRepoFavorited || favoritedSkills.has(skill);

            return (
              <ListItem
                key={skill}
                data-testid="repository-skill-item"
                secondaryAction={
                  <FavoriteToggle
                    isFavorited={isSkillFavorited}
                    label={
                      isSkillFavorited
                        ? `Remove skill ${skill} from favorites`
                        : `Favorite skill ${skill}`
                    }
                    onToggle={() =>
                      isSkillFavorited
                        ? removeFavorite(repository.id, skill)
                        : addSkillFavorite(repository.id, skill)
                    }
                  />
                }
              >
                <ListItemText primary={skill} />
              </ListItem>
            );
          })}
        </List>
      )}
    </Container>
  );
}
