import { useParams } from 'react-router-dom';
import {
  Alert,
  Container,
  Heading,
  List,
  ListItem,
  ListItemText,
  Page404State,
  Skeleton,
  Stack,
  Typography
} from '@eleks-ui/components';

import { useSharedCollection } from '../../hooks/useSharedCollection';

export function SharedCollectionPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const { collection, isLoading, error } = useSharedCollection(shareId);

  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} />
      </Container>
    );
  }

  if (error || !collection) {
    return (
      <Container sx={{ py: 4 }}>
        <Stack alignItems="center" sx={{ py: 6 }}>
          <Page404State description="This shared collection could not be found." />
        </Stack>
      </Container>
    );
  }

  const installCommand = `npx skillstack add ${window.location.origin}/shared/${collection.shareId}`;

  return (
    <Container sx={{ py: 4 }} data-testid="shared-collection">
      <Heading
        variant="page"
        title="Shared collection"
        subtitle={`${collection.entries.length} repository(ies)`}
        divider
      />

      <List data-testid="shared-collection-list">
        {collection.entries.map(entry => (
          <ListItem key={entry.repoId} data-testid="shared-collection-item">
            <ListItemText
              primary={entry.repoSlug}
              secondary={
                entry.skills === 'all' ? 'All skills' : entry.skills.join(', ')
              }
            />
          </ListItem>
        ))}
      </List>

      <Alert severity="info" sx={{ mt: 3 }}>
        Install this collection via the CLI:
        <Typography
          component="code"
          sx={{ display: 'block', mt: 1, fontFamily: 'monospace' }}
        >
          {installCommand}
        </Typography>
      </Alert>
    </Container>
  );
}
