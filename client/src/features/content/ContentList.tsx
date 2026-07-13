import { useState } from 'react';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

import type { ContentItem } from '@shared';
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Stack,
  Typography
} from '@eleks-ui/components';

import type { SortTab, TypeFilter } from '../../App';
import { useContent } from './useContent';

interface ContentListProps {
  type: TypeFilter;
  tab: SortTab;
  searchQuery: string;
  selectedTag: string | null;
  agentFilter: string | null;
  onTagClick: (tag: string) => void;
}

interface ContentCardProps {
  item: ContentItem;
  selectedTag: string | null;
  onTagClick: (tag: string) => void;
}

const AUDIT_COLOR = {
  audited: 'success',
  pending: 'warning',
  none: null
} as const;

function formatAge(createdAt: string): string {
  const days = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 86_400_000
  );
  if (days < 1) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

function ContentCard({ item, selectedTag, onTagClick }: ContentCardProps) {
  const [copied, setCopied] = useState(false);

  const auditColor = AUDIT_COLOR[item.audit];
  const installCmd = item.type === 'skill' ? item.install : undefined;

  const handleCopy = () => {
    if (!installCmd) return;
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card key={item.slug} variant="outlined">
      <CardHeader
        title={item.name}
        subheader={`by ${item.author} · ${item.installs.toLocaleString()} installs · ${formatAge(item.createdAt)}`}
      />
      <CardContent>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {item.description}
        </Typography>

        {installCmd && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography
              variant="body2"
              component="code"
              sx={{ fontFamily: 'monospace', flexGrow: 1 }}
            >
              {installCmd}
            </Typography>
            <IconButton
              size="small"
              aria-label={copied ? 'copied' : 'copy install command'}
              onClick={handleCopy}
              color={copied ? 'success' : 'default'}
            >
              {copied ? (
                <CheckIcon fontSize="small" />
              ) : (
                <ContentCopyIcon fontSize="small" />
              )}
            </IconButton>
          </Stack>
        )}

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}>
          {item.tags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant={selectedTag === tag ? 'filled' : 'outlined'}
              onClick={() => onTagClick(tag)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Chip label={item.type} size="small" variant="outlined" />
          {item.agents.map(agent => (
            <Chip
              key={agent}
              label={agent}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
          {auditColor && (
            <Chip label={item.audit} size="small" color={auditColor} />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function sortItems(items: ContentItem[], tab: SortTab): ContentItem[] {
  const now = Date.now();
  return [...items].sort((a, b) => {
    if (tab === 'all-time') return b.installs - a.installs;
    if (tab === 'hot') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // trending: installs per day since creation (recency-weighted)
    const ageA = Math.max(
      1,
      (now - new Date(a.createdAt).getTime()) / 86_400_000
    );
    const ageB = Math.max(
      1,
      (now - new Date(b.createdAt).getTime()) / 86_400_000
    );
    return b.installs / ageB - a.installs / ageA;
  });
}

function filterItems(
  items: ContentItem[],
  searchQuery: string,
  selectedTag: string | null,
  agentFilter: string | null
): ContentItem[] {
  const q = searchQuery.toLowerCase().trim();
  return items.filter(item => {
    if (q) {
      const hit =
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q));
      if (!hit) return false;
    }
    if (selectedTag && !item.tags.includes(selectedTag)) return false;
    if (agentFilter && !item.agents.includes(agentFilter)) return false;
    return true;
  });
}

/** Renders catalog entries sorted and filtered according to the current UI state. */
export function ContentList({
  type,
  tab,
  searchQuery,
  selectedTag,
  agentFilter,
  onTagClick
}: ContentListProps) {
  const { items, loading, error } = useContent(type);

  if (loading) return <Typography>Loading…</Typography>;
  if (error)
    return <Typography color="error">Failed to load: {error}</Typography>;

  const visible = filterItems(
    sortItems(items, tab),
    searchQuery,
    selectedTag,
    agentFilter
  );

  if (visible.length === 0) return <Typography>No {type}s found.</Typography>;

  return (
    <Stack spacing={2}>
      {visible.map(item => (
        <ContentCard
          key={item.slug}
          item={item}
          selectedTag={selectedTag}
          onTagClick={onTagClick}
        />
      ))}
    </Stack>
  );
}
