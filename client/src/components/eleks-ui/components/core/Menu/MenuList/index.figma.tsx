import { MenuList } from './index';
import figma from '@figma/code-connect';

figma.connect(MenuList, '<FIGMA_MENU_LIST>', {
  props: {
    dense: figma.boolean('Dense'),
    children: figma.children('<MenuItem>')
  },
  example: ({ children, ...props }) => (
    <MenuList {...props}>{children}</MenuList>
  )
});
