import { Alert } from './index';
import figma from '@figma/code-connect';

figma.connect(Alert, '<FIGMA_ALERT>', {
  props: {
    severity: figma.enum('Severity', {
      Error: 'error',
      Warning: 'warning',
      Info: 'info',
      Success: 'success'
    }),
    variant: figma.enum('Variant', {
      Filled: 'filled',
      Outlined: 'outlined',
      Standard: 'standard'
    }),
    description: figma.boolean('Description?', {
      true: figma.string('↳ Description'),
      false: ''
    }),
    title: figma.boolean('Title?', {
      true: figma.string('↳ Title'),
      false: ''
    }),
    action: figma.boolean('Action?', {
      true: figma.instance('↳Instance'),
      false: undefined
    }),
    onClose: figma.boolean('On Close?', {
      true: () => {},
      false: undefined
    })
  },
  example: ({ description, ...rest }) => <Alert {...rest}>{description}</Alert>
});
