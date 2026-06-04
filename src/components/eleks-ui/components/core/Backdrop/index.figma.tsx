import { Backdrop } from './index.js';
import figma from '@figma/code-connect';

figma.connect(Backdrop, '<FIGMA_BACKDROP>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => {
    return <Backdrop {...props}>{children}</Backdrop>;
  }
});
