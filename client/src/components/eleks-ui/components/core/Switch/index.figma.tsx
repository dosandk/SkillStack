import figma from '@figma/code-connect';
import { Switch } from './index';

figma.connect(Switch, '<FIGMA_SWITCH>', {
  props: {
    // These props were automatically mapped based on your linked code:
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary',
      Error: 'error',
      Info: 'info',
      Success: 'success',
      Warning: 'warning'
    }),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium'
    }),
    checked: figma.boolean('Checked'),
    disabled: figma.enum('State', {
      Disabled: true
    })
  },
  example: props => <Switch {...props} />
});
