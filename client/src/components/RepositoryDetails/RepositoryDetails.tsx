import {
  ErrorState,
  Heading,
  Link,
  List,
  ListItem,
  NoDataState,
  Page404State,
  Skeleton,
  Stack,
  Typography
} from '@eleks-ui/components';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams } from 'react-router-dom';

import { useRepositoryDetails } from '../../hooks/useRepositoryDetails';
import { useRouterLinkProps } from '../../hooks/useRouterLinkProps';
import { SkillList } from './SkillList';

const SKELETON_ROW_COUNT = 4;

export function RepositoryDetails() {
  const { id = '' } = useParams();
  const { status, repository, skills } = useRepositoryDetails(id);
  const getLinkProps = useRouterLinkProps();

  return (
    <>
      <Link
        {...getLinkProps('/')}
        underline="hover"
        data-testid="back-to-repositories"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2 }}
      >
        <ArrowBackIcon fontSize="small" />
        Back to repositories
      </Link>
      {status === 'loading' && (
        <List data-testid="repository-details-loading">
          {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
            <ListItem key={index}>
              <Skeleton variant="text" width="60%" />
            </ListItem>
          ))}
        </List>
      )}
      {status === 'not-found' && (
        <Stack
          alignItems="center"
          sx={{ py: 6 }}
          data-testid="repository-not-found"
        >
          <Page404State description="This repository does not exist." />
        </Stack>
      )}
      {status === 'error' && (
        <Stack
          alignItems="center"
          sx={{ py: 6 }}
          data-testid="repository-details-error"
        >
          <ErrorState description="Could not load this repository. Please try again later." />
        </Stack>
      )}
      {status === 'ready' && repository && (
        <>
          <Heading
            variant="page"
            title={repository.repoSlug}
            subtitle={repository.owner}
            divider
          />
          {skills.length === 0 ? (
            <Stack alignItems="center" sx={{ py: 6 }} data-testid="skill-empty">
              <NoDataState />
              <Typography>This repository has no skills yet.</Typography>
            </Stack>
          ) : (
            <SkillList repoSlug={repository.repoSlug} skills={skills} />
          )}
        </>
      )}
    </>
  );
}
