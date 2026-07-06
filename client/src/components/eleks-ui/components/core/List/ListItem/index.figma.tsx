import { ListItem } from './index';
import { ListItemText } from '../ListItemText/index';
import { ListItemIcon } from '../ListItemIcon/index';
import figma from '@figma/code-connect';

const sharedProps = {
  dense: figma.boolean('Dense'),
  disableGutters: figma.boolean('Dis. Gutters'),
  divider: figma.boolean('Divider'),
  secondaryAction: figma.instance('Right Slot'),
  primaryText: figma.string('Label'),
  secondaryText: figma.boolean('Second. Text', {
    true: 'Secondary',
    false: undefined
  })
};

figma.connect(ListItem, '<FIGMA_LIST_ITEM>', {
  props: {
    ...sharedProps,
    leftSlot: figma.instance('Left Slot')
  },
  example: ({ primaryText, secondaryText, leftSlot, ...props }) => (
    <ListItem {...props}>
      <ListItemIcon>{leftSlot}</ListItemIcon>
      <ListItemText primary={primaryText} secondary={secondaryText} />
    </ListItem>
  )
});

figma.connect(ListItem, '<FIGMA_LIST_ITEM>', {
  variant: {
    'Left Slot?': false
  },
  props: {
    ...sharedProps
  },
  example: ({ primaryText, secondaryText, ...props }) => (
    <ListItem {...props}>
      <ListItemText primary={primaryText} secondary={secondaryText} />
    </ListItem>
  )
});
