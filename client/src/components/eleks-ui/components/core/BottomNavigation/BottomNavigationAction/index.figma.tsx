import { BottomNavigationAction } from './index';
import figma from '@figma/code-connect';

figma.connect(BottomNavigationAction, '<FIGMA_BOTTOM_NAVIGATION_ACTION>', {
  props: {
    label: figma.string('Label Content'),
    icon: figma.children('*')
  },
  example: props => <BottomNavigationAction {...props} />
});

figma.connect(BottomNavigationAction, '<FIGMA_BOTTOM_NAVIGATION_ACTION>', {
  variant: { Label: false },
  props: {
    label: figma.string('Label Content'),
    icon: figma.children('*')
  },
  example: props => <BottomNavigationAction showLabel={false} {...props} />
});
