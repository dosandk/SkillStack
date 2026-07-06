import { DesktopStepper } from './index';
import figma from '@figma/code-connect';

figma.connect(DesktopStepper, '<FIGMA_STEPPER_DESKTOP>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => {
    return <DesktopStepper {...props}>{children}</DesktopStepper>;
  }
});
