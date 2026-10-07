import {
  AppBar,
  Avatar,
  Button,
  Stack,
  Toolbar,
  Typography
} from '@eleks-ui/components';

import { useAuth } from '../../context/AuthContext';
import { AppLink } from '../RouterLink/AppLink';
import { AppNavButton } from '../RouterLink/AppNavButton';

export function AppHeader() {
  const { user, isLoading, signIn, signOut } = useAuth();

  const handleSignIn = () => {
    signIn().catch((error: unknown) => {
      console.error('Sign-in failed:', error);
    });
  };

  const handleSignOut = () => {
    signOut().catch((error: unknown) => {
      console.error('Sign-out failed:', error);
    });
  };

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <AppLink to="/" underline="none" color="inherit">
            SkillStack
          </AppLink>
        </Typography>

        <AppNavButton to="/">Catalog</AppNavButton>
        <AppNavButton to="/favorites">Favorites</AppNavButton>

        {!isLoading && !user && (
          <Button variant="outlined" onClick={handleSignIn}>
            Sign in with GitHub
          </Button>
        )}

        {!isLoading && user && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              src={user.photoURL ?? undefined}
              sx={{ width: 32, height: 32 }}
            >
              {user.displayName?.charAt(0) ?? '?'}
            </Avatar>
            <Button variant="outlined" onClick={handleSignOut}>
              Sign out
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}
