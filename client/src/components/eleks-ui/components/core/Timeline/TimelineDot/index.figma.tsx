import { TimelineDot } from './index';
import figma from '@figma/code-connect';

figma.connect(TimelineDot, '<FIGMA_TIMELINE_DOT>', {
  props: {
    variant: figma.enum('Variant', {
      'Filled*': 'filled',
      Outlined: 'outlined'
    }),
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <TimelineDot {...props}>{children}</TimelineDot>
  )
});
