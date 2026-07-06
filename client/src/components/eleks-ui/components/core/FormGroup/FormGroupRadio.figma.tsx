import { FormControl } from './index';
import figma from '@figma/code-connect';

figma.connect('<FIGMA_FORM_GROUP_RADIO>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => {
    return <FormControl {...props}>{children}</FormControl>;
  }
});
