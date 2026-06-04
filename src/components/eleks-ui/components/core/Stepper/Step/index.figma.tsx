import { Step, StepLabel } from './index';
import figma from '@figma/code-connect';

figma.connect(Step, '<FIGMA_STEP>', {
  props: {
    stepTitleContent: figma.string('Step Title Content'),
    optional: figma.string('Optional Content')
  },
  example: ({ stepTitleContent, optional, ...props }) => {
    return (
      <Step {...props}>
        <StepLabel optional={optional}>{stepTitleContent}</StepLabel>
      </Step>
    );
  }
});
