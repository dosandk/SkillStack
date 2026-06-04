import figma from '@figma/code-connect';
import { Tab } from './index';

figma.connect(Tab, '<FIGMA_TAB>', {
  props: {
    disabled: figma.enum('State', {
      Disabled: true
    }),
    label: figma.boolean('Text', {
      true: figma.string('Tab Content'),
      false: undefined
    }),
    icon: figma.boolean('Icon', {
      true: figma.children('<Icon>'),
      false: undefined
    }),
    iconPosition: figma.enum('Icon Position', {
      Up: 'top',
      Left: 'start',
      Right: 'end'
    })
  },
  example: props => <Tab {...props} />
});
