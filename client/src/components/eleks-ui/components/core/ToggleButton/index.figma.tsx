import figma from '@figma/code-connect';
import { ToggleButton } from './index';

figma.connect(ToggleButton, '<FIGMA_TOGGLE_BUTTON>', {
  props: {
    // These props were automatically mapped based on your linked code:
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Large: 'large'
    }),
    disabled: figma.enum('State', {
      Disabled: true
    }),
    selected: figma.boolean('Selected'),
    icon: figma.boolean('Icon?', {
      true: figma.instance('Icon'),
      false: undefined
    }),
    text: figma.boolean('Text?', {
      true: 'value',
      false: undefined
    })
  },
  example: ({ icon, text, ...props }) => (
    <ToggleButton {...props}>
      {icon}
      {text}
    </ToggleButton>
  )
});
