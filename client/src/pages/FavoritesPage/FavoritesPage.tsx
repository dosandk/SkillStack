import { useState } from 'react';
import {
  Alert,
  Button,
  Container,
  ErrorState,
  Heading,
  List,
  ListItem,
  ListItemText,
  NoDataState,
  Page401State,
  Skeleton,
  Snackbar,
  Stack
} from '@eleks-ui/components';

import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../hooks/useFavorites';
import { createShareLink } from '../../lib/api';

export function FavoritesPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ py: 4 }}>
        <Stack alignItems="center" sx={{ py: 6 }}>
          <Page401State description="Sign in with GitHub to view and share your favorites." />
        </Stack>
      </Container>
    );
  }

  return <FavoritesContent key={user.uid} />;
}

function FavoritesContent() {
  const { favorites, isLoading, error, removeFavorite } = useFavorites();
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isCopyConfirmationOpen, setIsCopyConfirmationOpen] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const handleShare = async (repoIds?: string[]) => {
    try {
      const shareId = await createShareLink(repoIds);
      const url = `${window.location.origin}/shared/${shareId}`;

      await navigator.clipboard.writeText(url);

      setShareLink(url);
      setIsCopyConfirmationOpen(true);
      setShareError(null);
    } catch (createError: unknown) {
      console.error('Failed to create share link:', createError);
      setShareError('Could not create a share link. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Stack alignItems="center" sx={{ py: 6 }}>
          <ErrorState description="Could not load your favorites. Please try again later." />
        </Stack>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Heading
        variant="page"
        title="Favorites"
        subtitle="Repositories and skills you have favorited"
        actions={
          favorites.length > 0 && (
            <Button variant="contained" onClick={() => handleShare()}>
              Share all favorites
            </Button>
          )
        }
        divider
      />

      {favorites.length === 0 && <NoDataState />}

      {favorites.length > 0 && (
        <List data-testid="favorites-list">
          {favorites.map(entry => (
            <ListItem
              key={entry.repoId}
              data-testid="favorites-item"
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    onClick={() => handleShare([entry.repoId])}
                  >
                    Share
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => removeFavorite(entry.repoId)}
                  >
                    Remove
                  </Button>
                </Stack>
              }
            >
              <ListItemText
                primary={entry.repoSlug}
                secondary={
                  entry.all
                    ? 'All skills favorited'
                    : `${entry.skills.length} skill(s): ${entry.skills.join(', ')}`
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {shareError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {shareError}
        </Alert>
      )}

      <Snackbar
        open={isCopyConfirmationOpen}
        autoHideDuration={4000}
        onClose={() => setIsCopyConfirmationOpen(false)}
        message={
          shareLink ? `Share link copied: ${shareLink}` : 'Share link copied'
        }
      />
    </Container>
  );
}
