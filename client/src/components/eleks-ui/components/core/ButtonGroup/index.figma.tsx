import { ButtonGroup } from './index';
import figma from '@figma/code-connect';

figma.connect(ButtonGroup, '<FIGMA_BUTTON_GROUP>', {
  props: {
    color: figma.enum('Color', {
      Inherit: 'inherit',
      Primary: 'primary',
      Secondary: 'secondary',
      Error: 'error',
      Info: 'info',
      Success: 'success',
      Warning: 'warning'
    }),
    orientation: figma.enum('Orientation', {
      Horizontal: 'horizontal',
      Vertical: 'vertical'
    }),
    variant: figma.enum('Variant', {
      Text: 'text',
      Contained: 'contained',
      Outlined: 'outlined'
    }),
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <ButtonGroup {...props}>{children}</ButtonGroup>
  )
});
