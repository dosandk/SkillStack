import { ToggleButtonGroup } from './index';
import figma from '@figma/code-connect';

figma.connect(ToggleButtonGroup, '<FIGMA_TOGGLE_BUTTON_GROUP>', {
  props: {
    orientation: figma.enum('Orientation', {
      Horizontal: 'horizontal',
      Vertical: 'vertical'
    }),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Large: 'large'
    }),
    children: figma.children('<ToggleButton>')
    // No matching props could be found for these Figma properties:
    // "single": figma.boolean('Single')
  },
  example: ({ children, ...props }) => (
    <ToggleButtonGroup exclusive {...props}>
      {children}
    </ToggleButtonGroup>
  )
});
