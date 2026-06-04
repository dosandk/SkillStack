import { MenuItem } from './index';
import { ListItemText } from '../../List/ListItemText/index';
import { ListItemIcon } from '../../List/ListItemIcon/index';
import figma from '@figma/code-connect';

const sharedProps = {
  dense: figma.boolean('Dense'),
  disableGutters: figma.boolean('Dis. Gutters'),
  divider: figma.boolean('Divider'),
  rightSlot: figma.instance('Right Instance'),
  primaryText: figma.string('Value'),
  value: figma.string('Value'),
  key: figma.string('Value'),
  disabled: figma.enum('State', {
    Disabled: true
  }),
  selected: figma.enum('State', {
    Selected: true
  })
};

figma.connect(MenuItem, '<FIGMA_MENU_ITEM>', {
  props: {
    ...sharedProps,
    leftSlot: figma.instance('Left Instance')
  },
  example: ({ primaryText, leftSlot, rightSlot, ...props }) => (
    <MenuItem {...props}>
      <ListItemIcon>{leftSlot}</ListItemIcon>
      <ListItemText primary={primaryText} />
      {rightSlot}
    </MenuItem>
  )
});

figma.connect(MenuItem, '<FIGMA_MENU_ITEM>', {
  variant: {
    'Left Slot': false
  },
  props: {
    ...sharedProps
  },
  example: ({ primaryText, rightSlot, ...props }) => (
    <MenuItem {...props}>
      <ListItemText primary={primaryText} />
      {rightSlot}
    </MenuItem>
  )
});
