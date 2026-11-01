import { useState } from 'react';

import {
  Alert,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Stack
} from '@eleks-ui/components';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { buildInstallCommand } from '@shared';

const FEEDBACK_HIDE_DURATION_MS = 8000;

interface Skill {
  name: string;
  installCount: number;
  description?: string;
}

interface SkillListProps {
  repoSlug: string;
  skills: Skill[];
}

type CopyFeedback =
  | { status: 'success' }
  | { status: 'error'; command: string }
  | { status: 'refused' };

const formatInstallCount = (installCount: number) =>
  `${installCount} ${installCount === 1 ? 'install' : 'installs'}`;

const REFUSAL_MESSAGE =
  'Could not build a safe install command for this skill.';

const getFeedbackMessage = (feedback: CopyFeedback): string => {
  switch (feedback.status) {
    case 'success':
      return 'Install command copied';
    case 'refused':
      return REFUSAL_MESSAGE;
    default:
      return `Could not copy the install command. Run: ${feedback.command}`;
  }
};

export function SkillList({ repoSlug, skills }: SkillListProps) {
  const [feedback, setFeedback] = useState<CopyFeedback | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const copyInstallCommand = async (skillName: string) => {
    const command = buildInstallCommand(repoSlug, skillName);

    if (command === null) {
      setFeedback({ status: 'refused' });
      setIsFeedbackOpen(true);

      return;
    }

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API is unavailable');
      }

      await navigator.clipboard.writeText(command);

      setFeedback({ status: 'success' });
    } catch {
      setFeedback({ status: 'error', command });
    }

    setIsFeedbackOpen(true);
  };

  const handleFeedbackClose = (_event: unknown, reason?: string) => {
    if (reason !== 'clickaway') {
      setIsFeedbackOpen(false);
    }
  };

  return (
    <>
      <List data-testid="skill-list">
        {skills.map(skill => (
          <ListItem
            key={skill.name}
            data-testid="skill-item"
            sx={{ pr: 40 }}
            secondaryAction={
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={formatInstallCount(skill.installCount)}
                  color="primary"
                  variant="outlined"
                  data-testid="skill-install-count"
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  data-testid="skill-copy-button"
                  onClick={() => copyInstallCommand(skill.name)}
                >
                  Copy install command
                </Button>
              </Stack>
            }
          >
            <ListItemText
              primary={skill.name}
              secondary={skill.description || undefined}
            />
          </ListItem>
        ))}
      </List>
      <Snackbar
        open={isFeedbackOpen}
        autoHideDuration={FEEDBACK_HIDE_DURATION_MS}
        onClose={handleFeedbackClose}
      >
        {feedback ? (
          <Alert
            severity={feedback.status === 'success' ? 'success' : 'error'}
            data-testid="copy-feedback"
            onClose={handleFeedbackClose}
          >
            {getFeedbackMessage(feedback)}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
