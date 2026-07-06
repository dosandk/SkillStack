import { Radio } from './index';
import figma from '@figma/code-connect';

figma.connect(Radio, '<FIGMA_RADIO>', {
  props: {
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
    checked: figma.boolean('Checked'),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium'
    })
  },
  example: props => <Radio {...props} />
});
