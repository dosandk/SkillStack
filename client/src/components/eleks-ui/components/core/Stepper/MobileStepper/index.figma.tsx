import { MobileStepper } from './index';
import figma from '@figma/code-connect';

figma.connect(MobileStepper, '<FIGMA_STEPPER_MOBILE>', {
  props: {
    variant: figma.enum('Progress Type', {
      Text: 'text',
      Dots: 'dots',
      Progress: 'progress'
    })
  },
  example: props => <MobileStepper {...props} />
});
