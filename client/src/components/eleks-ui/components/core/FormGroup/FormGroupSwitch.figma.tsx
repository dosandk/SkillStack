import { FormControl, FormGroup } from './index';
import figma from '@figma/code-connect';

figma.connect('<FIGMA_FORM_GROUP_SWITCH>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => {
    return (
      <FormControl {...props}>
        <FormGroup>{children}</FormGroup>
      </FormControl>
    );
  }
});
