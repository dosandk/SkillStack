import { Badge } from './index';
import figma from '@figma/code-connect';

figma.connect(Badge, '<FIGMA_BADGE>', {
  props: {
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary',
      Error: 'error',
      Info: 'info',
      Success: 'success',
      Warning: 'warning'
    }),
    variant: figma.enum('Variant', {
      Standard: 'standard',
      Dot: 'dot'
    }),
    badgeContent: figma.string('Content'),
    children: figma.children('*')
  },
  example: ({ children, ...props }) => <Badge {...props}>{children}</Badge>
});
