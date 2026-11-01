import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Returns a function that builds the props of a real link (`href`, so it can
 * be opened in a new tab) that still navigates client-side on a plain left
 * click.
 */
export function useRouterLinkProps() {
  const navigate = useNavigate();

  return (to: string) => ({
    href: to,
    onClick: (event: MouseEvent<HTMLElement>) => {
      const isPlainLeftClick =
        event.button === 0 &&
        !event.defaultPrevented &&
        !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);

      if (isPlainLeftClick) {
        event.preventDefault();
        navigate(to);
      }
    }
  });
}
