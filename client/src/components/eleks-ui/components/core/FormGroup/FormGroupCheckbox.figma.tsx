import { FormGroup } from './index';
import { Form } from '../Form';
import figma from '@figma/code-connect';

figma.connect('<FIGMA_FORM_GROUP_CHECKBOX>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => {
    return (
      <Form {...props}>
        <FormGroup>{children}</FormGroup>
      </Form>
    );
  }
});
