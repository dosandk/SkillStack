import { TextField } from '../index';
import figma from '@figma/code-connect';

figma.connect(TextField, '<FIGMA_TEXT_FIELD_MULTILINE>', {
  props: {
    variant: figma.enum('Variant', {
      Standard: 'standard',
      Outlined: 'outlined',
      Filled: 'filled'
    }),
    minRows: figma.boolean('Min Rows', {
      true: '3',
      false: undefined
    }),
    maxRows: figma.boolean('Max Rows', {
      true: '5',
      false: undefined
    }),
    rows: figma.enum('Rows', {
      '4': '4',
      '6': '6',
      '8': '8'
    })
  },
  example: props => (
    <TextField
      {...props}
      multiline
      value={
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
      }
    />
  )
});
