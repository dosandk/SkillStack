import { Badge } from '../index';
import figma from '@figma/code-connect';

figma.connect(Badge, '<FIGMA_BADGE_WITH_INSTANCE>', {
  props: {
    badgeProps: figma.nestedProps('<Badge>', {
      badgeContent: figma.string('Content')
    }),
    component: figma.instance('Component'),
    variant: figma.enum('Variant', {
      Standard: 'standard',
      Dot: 'dot'
    }),
    color: figma.enum('Color', {
      Default: 'default',
      Primary: 'primary',
      Secondary: 'secondary',
      Error: 'error',
      Warning: 'warning',
      Info: 'info',
      Success: 'success'
    })
  },
  example: ({ component, badgeProps, ...props }) => (
    <Badge badgeContent={badgeProps.badgeContent} {...props}>
      {component}
    </Badge>
  )
});
