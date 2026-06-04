import { Stepper } from './index';
import figma from '@figma/code-connect';

figma.connect(Stepper, '<FIGMA_STEPPER>', {
  props: {
    alternativeLabel: figma.enum('Text', {
      Center: true,
      Left: false
    }),
    orientation: figma.enum('Alignment', {
      'Horizontal*': 'horizontal',
      Vertical: 'vertical'
    }),
    children: figma.children('<Step>')
  },
  example: ({ alternativeLabel, children, ...props }) => (
    <Stepper alternativeLabel={alternativeLabel} activeStep={0} {...props}>
      {children}
    </Stepper>
  )
});
