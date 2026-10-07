import type { ComponentProps, ComponentType } from 'react';
import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps
} from 'react-router-dom';

import { Button } from '@eleks-ui/components';

type EleksButtonProps = ComponentProps<typeof Button>;

export type AppNavButtonProps = Omit<EleksButtonProps, 'component' | 'href'> &
  Pick<RouterLinkProps, 'to'>;

// NOTE: same typing gap as AppLink — the local @eleks-ui/components Button wrapper
// re-exports MUI's non-generic ButtonProps default, so it doesn't know about
// react-router's `to` prop even though MUI's Button renders whatever `component` is
// passed at runtime. This cast is the single place that bridges the gap.
const RouterAwareButton = Button as unknown as ComponentType<
  AppNavButtonProps & { component: typeof RouterLink }
>;

export function AppNavButton({ to, children, ...rest }: AppNavButtonProps) {
  return (
    <RouterAwareButton component={RouterLink} to={to} {...rest}>
      {children}
    </RouterAwareButton>
  );
}
