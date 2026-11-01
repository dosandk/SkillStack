import {
  Avatar,
  Chip,
  ErrorState,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  NoDataState,
  Skeleton,
  Stack
} from '@eleks-ui/components';
import FolderIcon from '@mui/icons-material/Folder';

import { useRepositories } from '../../hooks/useRepositories';
import { useRouterLinkProps } from '../../hooks/useRouterLinkProps';

const SKELETON_ROW_COUNT = 4;

export function RepositoryList() {
  const { repositories, isLoading, error } = useRepositories();
  const getLinkProps = useRouterLinkProps();

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

        return (
          <ListItem
            key={repository.id}
            data-testid="repository-item"
            disablePadding
            secondaryAction={
              <Chip
                label={`${skillCount} skills`}
                color="primary"
                variant="outlined"
                data-testid="repository-skill-count"
              />
            }
          >
            <ListItemButton
              component="a"
              {...getLinkProps(
                `/repositories/${encodeURIComponent(repository.id)}`
              )}
              sx={{ pr: 14 }}
            >
              <Avatar sx={{ mr: 2 }}>
                <FolderIcon />
              </Avatar>
              <ListItemText
                primary={repository.repoSlug}
                secondary={repository.owner}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}
