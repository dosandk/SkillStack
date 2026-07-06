import { useEffect, useState } from 'react';

import type { ContentItem, ContentType } from '@shared';
import { CONTENT_TYPES, pluralOf } from '@shared';

interface ContentState {
  items: ContentItem[];
  loading: boolean;
  error: string | null;
}

type TypeFilter = ContentType | 'all';

interface InternalState extends ContentState {
  forType: TypeFilter;
}

/** Fetches catalog entries for a single type or all types in parallel. */
export function useContent(type: TypeFilter): ContentState {
  const [state, setState] = useState<InternalState>({
    items: [],
    loading: true,
    error: null,
    forType: type
  });

  useEffect(() => {
    let cancelled = false;

    const fetches =
      type === 'all'
        ? CONTENT_TYPES.map(t =>
            fetch(`/api/${pluralOf(t)}`).then(res => {
              if (!res.ok) throw new Error(`Request failed: ${res.status}`);
              return res.json() as Promise<ContentItem[]>;
            })
          )
        : [
            fetch(`/api/${pluralOf(type)}`).then(res => {
              if (!res.ok) throw new Error(`Request failed: ${res.status}`);
              return res.json() as Promise<ContentItem[]>;
            })
          ];

    Promise.all(fetches)
      .then(results => {
        if (!cancelled) {
          setState({
            items: results.flat(),
            loading: false,
            error: null,
            forType: type
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          setState({
            items: [],
            loading: false,
            error: message,
            forType: type
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [type]);

  // NOTE: while the type has changed but the fetch hasn't resolved, report
  // loading rather than stale results from the previous type.
  if (state.forType !== type) {
    return { items: [], loading: true, error: null };
  }
  return { items: state.items, loading: state.loading, error: state.error };
}
