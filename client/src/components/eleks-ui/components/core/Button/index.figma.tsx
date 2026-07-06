import { Button } from './index';
import figma from '@figma/code-connect';

figma.connect(Button, '<FIGMA_BUTTON>', {
  // NOTE: just example imports
  // imports: ["import { Button } from '@bugcrowd/bc-elements'"],
  props: {
    color: figma.enum('Color', {
      Inherit: 'inherit',
      Primary: 'primary',
      Secondary: 'secondary',
      Success: 'success',
      Error: 'error',
      Info: 'info',
      Warning: 'warning'
    }),
    disabled: figma.enum('State', {
      Disabled: true
    }),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Large: 'large'
    }),
    variant: figma.enum('Variant', {
      Text: 'text',
      Outlined: 'outlined',
      Contained: 'contained'
    }),
    label: figma.string('Label'),
    startIcon: figma.boolean('Start Icon', {
      true: figma.instance('↳ Start Icon'),
      false: undefined
    }),
    endIcon: figma.boolean('End Icon', {
      true: figma.instance('↳ End Icon'),
      false: undefined
    })
  },
  example: ({ label, ...props }) => <Button {...props}>{label}</Button>
});
