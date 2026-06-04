import { Toolbar } from './index';
import figma from '@figma/code-connect';

figma.connect(Toolbar, '<FIGMA_APPBAR_TOOLBAR>', {
  props: {
    variant: figma.enum('Variant', {
      Regular: 'regular',
      Dense: 'dense'
    }),
    children: figma.children('*')
    // smallScreen: figma.boolean("Small Screen"),
  },
  example: ({ children, ...props }) => <Toolbar {...props}>{children}</Toolbar>
});
