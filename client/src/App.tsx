import { useState } from 'react';

import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import { CONTENT_TYPES } from '@shared';
import type { ContentType } from '@shared';
import {
  Button,
  Chip,
  Container,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@eleks-ui/components';
import { useEleksUITheme } from '@eleks-ui/theme';

import { AuthControls } from './features/auth/AuthControls';
import { ContentList } from './features/content/ContentList';

export type SortTab = 'all-time' | 'hot' | 'trending';
export type TypeFilter = ContentType | 'all';

const KNOWN_AGENTS = ['cursor', 'claude-code', 'codex', 'copilot'];

function App() {
  const { mode, toggleTheme } = useEleksUITheme();
  const [type, setType] = useState<TypeFilter>('all');
  const [tab, setTab] = useState<SortTab>('all-time');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [agentFilter, setAgentFilter] = useState<string | null>(null);

  const handleTagClick = (tag: string) => {
    setSelectedTag(prev => (prev === tag ? null : tag));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          SkillStack
        </Typography>
        <AuthControls />
        <IconButton onClick={toggleTheme} aria-label="toggle theme">
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Stack>

      <Typography variant="body1" sx={{ mb: 3 }}>
        A catalog of skills, rules, MCPs, and agents.
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder="Search by name, description, or tag…"
        value={searchQuery}
        onChange={event => setSearchQuery(event.target.value)}
        sx={{ mb: 2 }}
      />

      <Tabs value={tab} onChange={(_, v: SortTab) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="All Time" value="all-time" />
        <Tab label="Hot" value="hot" />
        <Tab label="Trending" value="trending" />
      </Tabs>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant={type === 'all' ? 'contained' : 'outlined'}
          onClick={() => setType('all')}
        >
          All
        </Button>
        {CONTENT_TYPES.map(contentType => (
          <Button
            key={contentType}
            variant={contentType === type ? 'contained' : 'outlined'}
            onClick={() => setType(contentType)}
          >
            {contentType}s
          </Button>
        ))}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
        {KNOWN_AGENTS.map(agent => (
          <Chip
            key={agent}
            label={agent}
            size="small"
            variant={agentFilter === agent ? 'filled' : 'outlined'}
            color={agentFilter === agent ? 'primary' : 'default'}
            onClick={() =>
              setAgentFilter(prev => (prev === agent ? null : agent))
            }
          />
        ))}
      </Stack>

      <ContentList
        type={type}
        tab={tab}
        searchQuery={searchQuery}
        selectedTag={selectedTag}
        agentFilter={agentFilter}
        onTagClick={handleTagClick}
      />
    </Container>
  );
}

export default App;
