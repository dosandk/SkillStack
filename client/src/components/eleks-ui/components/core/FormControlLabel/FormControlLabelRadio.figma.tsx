import { FormControlLabel } from './index';
import figma from '@figma/code-connect';

figma.connect('<FIGMA_CONTROL_LABEL_RADIO>', {
  props: {
    labelPlacement: figma.enum('Label Placement', {
      End: 'end',
      Start: 'start',
      Top: 'top',
      Bottom: 'bottom'
    }),
    control: figma.children('<Radio>')
  },
  example: ({ control, ...props }) => {
    return <FormControlLabel {...props} control={control} label="Label" />;
  }
});
