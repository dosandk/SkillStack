import figma from '@figma/code-connect';
import { TextField } from './index';
import { InputAdornment } from './api/index';

const sharedProps = {
  label: figma.string('Label'),
  size: figma.enum('Size', {
    Small: 'small',
    Medium: 'medium'
  }),
  variant: figma.enum('Variant', {
    Filled: 'filled',
    Outlined: 'outlined',
    Standard: 'standard'
  }),
  disabled: figma.enum('State', {
    Disabled: true
  }),
  error: figma.enum('State', {
    Error: true
  }),
  value: figma.boolean('Active', {
    true: figma.boolean('Has Value', {
      true: figma.nestedProps('<MenuItem>', {
        data: figma.string('Value')
      }),
      false: { data: undefined }
    }),
    false: figma.boolean('Has Value', {
      true: { data: 'Default Value' },
      false: { data: undefined }
    })
  }),
  helper: figma.nestedProps('<FormHelperText>', {
    value: figma.string('Value')
  }),
  children: figma.boolean('Active', {
    true: figma.nestedProps('<Paper>', {
      MenuList: figma.instance('↳ Instance').getProps()
    }),
    false: { MenuList: { children: undefined } }
  })
};

figma.connect(TextField, '<FIGMA_SELECT>', {
  props: {
    ...sharedProps
  },
  example: ({ helper, value, children, ...props }) => {
    return (
      <TextField select helperText={helper.value} value={value.data} {...props}>
        {children.MenuList.children}
      </TextField>
    );
  }
});

figma.connect(TextField, '<FIGMA_SELECT>', {
  variant: {
    'Adorn. Start?': true
  },
  props: {
    ...sharedProps,
    adornStart: figma.boolean('Adorn. Start?', {
      true: figma.instance('Start Instance'),
      false: undefined
    })
  },
  example: ({ adornStart, helper, children, value, ...props }) => {
    return (
      <TextField
        select
        helperText={helper.value}
        value={value.data}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">{adornStart}</InputAdornment>
            )
          }
        }}
        {...props}
      >
        {children.MenuList.children}
      </TextField>
    );
  }
});
