import figma from '@figma/code-connect';

import { RadioGroup } from '../RadioGroup';

figma.connect('<FIGMA_RADIO_GROUP>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => {
    return <RadioGroup {...props}>{children}</RadioGroup>;
  }
});
