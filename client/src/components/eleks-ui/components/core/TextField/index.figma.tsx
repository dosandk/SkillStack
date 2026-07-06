import figma from '@figma/code-connect';
import { TextField } from './index';
import { InputAdornment } from './InputAdornment/index';

const sharedProps = {
  variant: figma.enum('Variant', {
    Filled: 'filled',
    Outlined: 'outlined',
    Standard: 'standard'
  }),
  size: figma.enum('Size', {
    Small: 'small',
    Medium: 'medium'
  }),
  label: figma.string('Label'),
  placeholder: figma.boolean('Placeholder?', {
    true: figma.string('↳ Placeholder'),
    false: undefined
  }),
  value: figma.boolean('Value?', {
    true: figma.string('↳ Value'),
    false: undefined
  }),
  disabled: figma.enum('State', {
    Disabled: true
  }),
  focused: figma.enum('State', {
    Focused: true
  }),
  error: figma.enum('State', {
    Error: true
  }),
  type: figma.boolean('Type: number?', {
    true: 'number',
    false: undefined
  }),
  helper: figma.nestedProps('<FormHelperText>', {
    value: figma.string('Value')
  })
};

figma.connect(TextField, '<FIGMA_TEXT_FIELD>', {
  props: {
    ...sharedProps
  },
  example: ({ helper, ...props }) => (
    <TextField helperText={helper.value} {...props} />
  )
});

figma.connect(TextField, '<FIGMA_TEXT_FIELD>', {
  variant: {
    'Adorn. Start?': true
  },
  props: {
    ...sharedProps,
    adornStart: figma.instance('↳ Start Instance')
  },
  example: ({ helper, adornStart, ...props }) => (
    <TextField
      helperText={helper.value}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">{adornStart}</InputAdornment>
          )
        }
      }}
      {...props}
    />
  )
});

figma.connect(TextField, '<FIGMA_TEXT_FIELD>', {
  variant: {
    'Adorn. End?': true
  },
  props: {
    ...sharedProps,
    adornEnd: figma.instance('↳ End Instance')
  },
  example: ({ helper, adornEnd, ...props }) => (
    <TextField
      helperText={helper.value}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="start">{adornEnd}</InputAdornment>
          )
        }
      }}
      {...props}
    />
  )
});

figma.connect(TextField, '<FIGMA_TEXT_FIELD>', {
  variant: {
    'Adorn. Start?': true,
    'Adorn. End?': true
  },
  props: {
    ...sharedProps,
    adornStart: figma.instance('↳ Start Instance'),
    adornEnd: figma.instance('↳ End Instance')
  },
  example: ({ helper, adornStart, adornEnd, ...props }) => (
    <TextField
      helperText={helper.value}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">{adornStart}</InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="start">{adornEnd}</InputAdornment>
          )
        }
      }}
      {...props}
    />
  )
});
