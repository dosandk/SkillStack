import { useState } from 'react';
import type { MouseEvent } from 'react';

import GitHubIcon from '@mui/icons-material/GitHub';
import LogoutIcon from '@mui/icons-material/Logout';

import {
  Avatar,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography
} from '@eleks-ui/components';

import { useAuth } from './useAuth';

export const AuthControls = () => {
  const { user, loading, signInWithGithub, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (loading) return null;

  if (!user) {
    return (
      <Button
        variant="outlined"
        startIcon={<GitHubIcon />}
        onClick={() => void signInWithGithub()}
      >
        Sign in
      </Button>
    );
  }

  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    void logout();
  };

  return (
    <>
      <IconButton onClick={handleOpen} aria-label="account menu">
        <Avatar
          src={user.photoURL ?? undefined}
          alt={user.displayName ?? 'user'}
          sx={{ width: 32, height: 32 }}
        >
          {user.displayName?.[0] ?? '?'}
        </Avatar>
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem disabled>
          <Typography variant="body2">
            {user.displayName ?? user.email ?? 'Signed in'}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
