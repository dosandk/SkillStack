import { List } from './index';
import figma from '@figma/code-connect';

figma.connect(List, '<FIGMA_LIST>', {
  props: {
    dense: figma.boolean('Dense'),
    disablePadding: figma.boolean('Dis. Padding'),
    children: figma.children('*')
  },
  example: ({ children, ...props }) => <List {...props}>{children}</List>
});
