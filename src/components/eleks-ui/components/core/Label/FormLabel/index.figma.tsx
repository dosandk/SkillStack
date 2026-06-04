import { FormLabel } from './index';
import figma from '@figma/code-connect';

figma.connect(FormLabel, '<FIGMA_FORM_LABEL>', {
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
    <FormLabel component="legend" {...props}>
      {value}
      {children}
    </FormLabel>
  )
});

figma.connect(FormLabel, '<FIGMA_FORM_LABEL>', {
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
    <FormLabel disabled component="legend" {...props}>
      {value}
      {children}
    </FormLabel>
  )
});

figma.connect(FormLabel, '<FIGMA_FORM_LABEL>', {
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
    <FormLabel error component="legend" {...props}>
      {value}
      {children}
    </FormLabel>
  )
});
