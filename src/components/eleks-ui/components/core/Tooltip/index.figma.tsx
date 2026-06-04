import figma from '@figma/code-connect';
import { Tooltip } from './index';

figma.connect(Tooltip, '<FIGMA_TOOLTIP>', {
  variant: {
    Direction: 'None'
  },
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <Tooltip title="Tooltip" {...props}>
      {children}
    </Tooltip>
  )
});

figma.connect(Tooltip, '<FIGMA_TOOLTIP>', {
  props: {
    direction: figma.enum('Direction', {
      Down: 'top',
      Up: 'bottom',
      Left: 'right',
      Right: 'left'
    }),
    children: figma.children('*')
  },
  example: ({ direction, children, ...props }) => (
    <Tooltip arrow title="Tooltip" placement={direction} {...props}>
      {children}
    </Tooltip>
  )
});
