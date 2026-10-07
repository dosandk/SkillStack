import type { ComponentProps, ComponentType } from 'react';
import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps
} from 'react-router-dom';

import { Link } from '@eleks-ui/components';

type EleksLinkProps = ComponentProps<typeof Link>;

export type AppLinkProps = Omit<EleksLinkProps, 'component' | 'href'> &
  Pick<RouterLinkProps, 'to'>;

// NOTE: the local @eleks-ui/components Link wrapper re-exports MUI's non-generic
// LinkProps default (root = 'a'), so it doesn't know about react-router's `to` prop
// even though MUI's Link renders whatever `component` is passed at runtime. This cast
// is the single place that bridges the gap so call sites stay fully typed.
const RouterAwareLink = Link as unknown as ComponentType<
  AppLinkProps & { component: typeof RouterLink }
>;

export function AppLink({ to, children, ...rest }: AppLinkProps) {
  return (
    <RouterAwareLink component={RouterLink} to={to} {...rest}>
      {children}
    </RouterAwareLink>
  );
}
