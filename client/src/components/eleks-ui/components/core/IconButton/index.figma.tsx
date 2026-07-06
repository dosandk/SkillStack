import figma from '@figma/code-connect';

import { IconButton } from './index';

figma.connect(IconButton, '<FIGMA_ICON_BUTTON>', {
  props: {
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Large: 'large'
    }),
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary',
      Error: 'error',
      Info: 'info',
      Success: 'success',
      Warning: 'warning'
    }),

    state: figma.enum('State', {
      Enabled: 'enabled',
      Focused: 'focused',
      Disabled: 'disabled',
      Pressed: 'pressed'
    }),
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <IconButton {...props}>{children}</IconButton>
  )
});
