import {
  Avatar,
  Chip,
  ErrorState,
  List,
  ListItem,
  ListItemText,
  NoDataState,
  Skeleton,
  Stack
} from '@eleks-ui/components';
import FolderIcon from '@mui/icons-material/Folder';

import { FavoriteToggle } from '../FavoriteToggle/FavoriteToggle';
import { AppLink } from '../RouterLink/AppLink';
import { useFavorites } from '../../hooks/useFavorites';
import { useRepositories } from '../../hooks/useRepositories';

const SKELETON_ROW_COUNT = 4;

export function RepositoryList() {
  const { repositories, isLoading, error } = useRepositories();
  const { favorites, addRepoFavorite, removeFavorite } = useFavorites();

  if (isLoading) {
    return (
      <List>
        {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
          <ListItem key={index}>
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              sx={{ mr: 2 }}
            />
            <Skeleton variant="text" width="60%" />
          </ListItem>
        ))}
      </List>
    );
  }

  if (error) {
    return (
      <Stack alignItems="center" sx={{ py: 6 }}>
        <ErrorState description="Could not load repositories. Please try again later." />
      </Stack>
    );
  }

  if (repositories.length === 0) {
    return (
      <Stack alignItems="center" sx={{ py: 6 }} data-testid="repository-empty">
        <NoDataState />
      </Stack>
    );
  }

  return (
    <List data-testid="repository-list">
      {repositories.map(repository => {
        const skillCount = repository.skills?.length ?? 0;
        const isFavorited =
          favorites.find(entry => entry.repoId === repository.id)?.all ?? false;

        return (
          <ListItem
            key={repository.id}
            data-testid="repository-item"
            secondaryAction={
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`${skillCount} skills`}
                  color="primary"
                  variant="outlined"
                  data-testid="repository-skill-count"
                />
                <FavoriteToggle
                  isFavorited={isFavorited}
                  label={
                    isFavorited
                      ? `Remove ${repository.repoSlug} from favorites`
                      : `Favorite ${repository.repoSlug}`
                  }
                  onToggle={() =>
                    isFavorited
                      ? removeFavorite(repository.id)
                      : addRepoFavorite(repository.id)
                  }
                />
              </Stack>
            }
          >
            <Avatar sx={{ mr: 2 }}>
              <FolderIcon />
            </Avatar>
            <ListItemText
              primary={
                <AppLink to={`/repositories/${repository.id}`}>
                  {repository.repoSlug}
                </AppLink>
              }
              secondary={repository.owner}
            />
          </ListItem>
        );
      })}
    </List>
  );
}
