import { InputLabel } from './index';
import figma from '@figma/code-connect';

figma.connect(InputLabel, '<FIGMA_INPUT_LABEL>', {
  props: {
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary',
      Error: 'error'
    }),
    value: figma.string('Value'),
    children: figma.children('*')
  },
  example: ({ value, children, ...props }) => (
    <InputLabel htmlFor="component-id" {...props}>
      {value}
      {children}
    </InputLabel>
  )
});

figma.connect(InputLabel, '<FIGMA_INPUT_LABEL>', {
  variant: { State: 'Disabled' },
  props: {
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary',
      Error: 'error'
    }),
    value: figma.string('Value'),
    children: figma.children('*')
  },
  example: ({ value, children, ...props }) => (
    <InputLabel disabled htmlFor="component-id" {...props}>
      {value}
      {children}
    </InputLabel>
  )
});

figma.connect(InputLabel, '<FIGMA_INPUT_LABEL>', {
  variant: { State: 'Error' },
  props: {
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary',
      Error: 'error'
    }),
    value: figma.string('Value'),
    children: figma.children('*')
  },
  example: ({ value, children, ...props }) => (
    <InputLabel error htmlFor="component-id" {...props}>
      {value}
      {children}
    </InputLabel>
  )
});
