import figma from '@figma/code-connect';
import { Menu } from './index';

figma.connect(Menu, '<FIGMA_MENU>', {
  props: {
    nestedProps: figma.nestedProps('<Paper>', {
      MenuList: figma.instance('↳ Instance').getProps()
    })
  },
  example: ({ nestedProps, ...props }) => (
    <Menu {...props}>{nestedProps.MenuList.children}</Menu>
  )
});
