import figma from '@figma/code-connect';
import { Drawer } from './index';

figma.connect(Drawer, '<FIGMA_DRAWER>', {
  props: {
    chidlren: figma.children('*')
  },
  example: ({ chidlren, ...props }) => <Drawer {...props}>{chidlren}</Drawer>
});
