import { FormHelperText } from './index';
import figma from '@figma/code-connect';

figma.connect(FormHelperText, '<FIGMA_FORM_HELPER_TEXT>', {
  props: {
    value: figma.string('Value'),
    children: figma.children('*')
  },
  example: ({ value, children, ...props }) => (
    <FormHelperText {...props}>
      {value}
      {children}
    </FormHelperText>
  )
});

figma.connect(FormHelperText, '<FIGMA_FORM_HELPER_TEXT>', {
  variant: { Disabled: 'Disabled' },
  props: {
    value: figma.string('Value'),
    children: figma.children('*')
  },
  example: ({ value, children, ...props }) => (
    <FormHelperText disabled {...props}>
      {value}
      {children}
    </FormHelperText>
  )
});

figma.connect(FormHelperText, '<FIGMA_FORM_HELPER_TEXT>', {
  variant: { Disabled: 'Error' },
  props: {
    value: figma.string('Value'),
    children: figma.children('*')
  },
  example: ({ value, children, ...props }) => (
    <FormHelperText error {...props}>
      {value}
      {children}
    </FormHelperText>
  )
});
