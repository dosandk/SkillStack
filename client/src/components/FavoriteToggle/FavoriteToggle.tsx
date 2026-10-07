import { useState } from 'react';

import { IconButton } from '@eleks-ui/components';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';

import { useAuth } from '../../context/AuthContext';
import { SignInPromptDialog } from '../SignInPrompt/SignInPromptDialog';

interface FavoriteToggleProps {
  isFavorited: boolean;
  label: string;
  onToggle: () => Promise<void>;
}

export function FavoriteToggle({
  isFavorited,
  label,
  onToggle
}: FavoriteToggleProps) {
  const { user } = useAuth();
  const [isSignInPromptOpen, setIsSignInPromptOpen] = useState(false);

  const handleClick = () => {
    if (!user) {
      setIsSignInPromptOpen(true);
      return;
    }

    onToggle().catch((error: unknown) => {
      console.error(`Failed to toggle favorite for "${label}":`, error);
    });
  };

  return (
    <>
      <IconButton
        aria-label={label}
        onClick={handleClick}
        color={isFavorited ? 'primary' : 'default'}
      >
        {isFavorited ? <Favorite /> : <FavoriteBorder />}
      </IconButton>
      <SignInPromptDialog
        open={isSignInPromptOpen}
        onClose={() => setIsSignInPromptOpen(false)}
      />
    </>
  );
}
