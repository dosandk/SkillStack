import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@eleks-ui/components';

import { useAuth } from '../../context/AuthContext';

interface SignInPromptDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SignInPromptDialog({ open, onClose }: SignInPromptDialogProps) {
  const { signIn } = useAuth();

  const handleSignIn = () => {
    signIn()
      .then(onClose)
      .catch((error: unknown) => {
        console.error('Sign-in failed:', error);
      });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Sign in required</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Sign in with GitHub to favorite repositories and skills.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSignIn}>
          Sign in with GitHub
        </Button>
      </DialogActions>
    </Dialog>
  );
}
