import { Stack } from './index';
import figma from '@figma/code-connect';

figma.connect(Stack, '<FIGMA_STACK>', {
  props: {
    direction: figma.enum('Direction', {
      Column: 'column',
      Row: 'row'
    }),
    spacing: figma.enum('Spacing', {
      '1': 1,
      '0': 0,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8
    }),
    children: figma.children('*')
  },
  example: ({ children, ...props }) => <Stack {...props}>{children}</Stack>
});
