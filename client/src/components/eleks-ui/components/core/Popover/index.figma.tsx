import figma from '@figma/code-connect';
import { Popover } from './index';

figma.connect(Popover, '<FIGMA_POPOVER>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => <Popover {...props}>{children}</Popover>
});
