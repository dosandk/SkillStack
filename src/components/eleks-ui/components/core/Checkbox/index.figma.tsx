import figma from '@figma/code-connect';
import { Checkbox } from './index';

figma.connect(Checkbox, '<FIGMA_CHECKBOX>', {
  props: {
    checked: figma.boolean('Checked'),
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary',
      Error: 'error',
      Info: 'info',
      Success: 'success',
      Warning: 'warning',
      Default: 'default'
    }),
    disabled: figma.enum('State', {
      Disabled: true
    }),
    indeterminate: figma.boolean('Indeterminate'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Large: 'large'
    })
  },
  example: props => <Checkbox {...props} />
});
