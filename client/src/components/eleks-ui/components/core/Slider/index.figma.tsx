import figma from '@figma/code-connect';
import { Slider } from './index';

figma.connect(Slider, '<FIGMA_SLIDER>', {
  variant: {
    Variant: 'Range'
  },
  props: {
    disabled: figma.enum('State', {
      Disabled: true
    }),
    orientation: figma.enum('Orientation', {
      Horizontal: 'horizontal',
      Vertical: 'vertical'
    }),
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary'
    }),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium'
    }),
    label: figma.boolean('Label', {
      true: 'on',
      false: 'off'
    }),
    values: figma.boolean('Values', {
      true: [
        { value: 0, label: '0' },
        { value: 2, label: '' },
        { value: 4, label: '' },
        { value: 6, label: '' },
        { value: 8, label: '' },
        { value: 10, label: '' },
        { value: 12, label: '12' }
      ],
      false: undefined
    })
  },
  example: ({ label, values, ...props }) => {
    return (
      <Slider
        {...props}
        marks={values}
        step={2}
        valueLabelDisplay={label}
        min={0}
        max={12}
        defaultValue={[4, 6]}
      />
    );
  }
});

figma.connect(Slider, '<FIGMA_SLIDER>', {
  variant: {
    Variant: 'Marks'
  },
  props: {
    disabled: figma.enum('State', {
      Disabled: true
    }),
    orientation: figma.enum('Orientation', {
      Horizontal: 'horizontal',
      Vertical: 'vertical'
    }),
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary'
    }),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium'
    }),
    label: figma.boolean('Label', {
      true: 'on',
      false: 'off'
    }),
    values: figma.boolean('Values', {
      true: [
        { value: 0, label: '0' },
        { value: 2, label: '' },
        { value: 4, label: '' },
        { value: 6, label: '' },
        { value: 8, label: '' },
        { value: 10, label: '' },
        { value: 12, label: '12' }
      ],
      false: undefined
    })
  },
  example: ({ label, values, ...props }) => {
    return (
      <Slider
        {...props}
        marks={values}
        step={2}
        valueLabelDisplay={label}
        min={0}
        max={12}
        defaultValue={4}
      />
    );
  }
});

figma.connect(Slider, '<FIGMA_SLIDER>', {
  variant: {
    Variant: 'Continuous'
  },
  props: {
    disabled: figma.enum('State', {
      Disabled: true
    }),
    orientation: figma.enum('Orientation', {
      Horizontal: 'horizontal',
      Vertical: 'vertical'
    }),
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary'
    }),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium'
    }),
    label: figma.boolean('Label', {
      true: 'on',
      false: 'off'
    }),
    values: figma.boolean('Values', {
      true: [
        { value: 0, label: '0' },
        { value: 12, label: '12' }
      ],
      false: undefined
    })
  },
  example: ({ label, values, ...props }) => {
    return (
      <Slider
        {...props}
        marks={values}
        valueLabelDisplay={label}
        min={0}
        max={12}
        defaultValue={4}
      />
    );
  }
});
