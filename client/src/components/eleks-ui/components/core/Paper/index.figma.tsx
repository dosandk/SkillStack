import { Paper } from './index';
import figma from '@figma/code-connect';

figma.connect(Paper, '<FIGMA_PAPER>', {
  props: {
    square: figma.boolean('Square'),
    variant: figma.enum('Variant', {
      Elevation: 'elevation',
      Outlined: 'outlined'
    }),
    children: figma.boolean('Instance Slot?', {
      true: figma.instance('↳ Instance'),
      false: undefined
    })
  },
  example: ({ children, ...rest }) => <Paper {...rest}>{children}</Paper>
});
