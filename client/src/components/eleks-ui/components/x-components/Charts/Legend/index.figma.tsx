import figma from '@figma/code-connect';

// eslint-disable-next-line react-refresh/only-export-components
const Legend = () => <>/* this is legend*/</>;

figma.connect(Legend, '<FIGMA_CHARTS_LEGEND>', {
  props: {
    series1: figma.string('Series 1'),
    series2: figma.boolean('Series 2?', {
      true: figma.string('Series 2'),
      false: undefined
    }),
    series3: figma.boolean('Series 3?', {
      true: figma.string('Series 3'),
      false: undefined
    }),
    series4: figma.boolean('Series 4?', {
      true: figma.string('Series 4'),
      false: undefined
    }),
    direction: figma.enum('Direction', {
      Horizontal: 'horizontal',
      Vertical: 'vertical'
    })
  },
  example: ({ ...props }) => <Legend {...props} />
});
