import { Typography } from './index';
import figma from '@figma/code-connect';

figma.connect(Typography, '<FIGMA_TYPOGRAPHY>', {
  props: {
    children: figma.string('Content'),
    variant: figma.enum('Variant', {
      body1: 'body1',
      body2: 'body2',
      subtitle1: 'subtitle1',
      subtitle2: 'subtitle2',
      overline: 'overline',
      caption: 'caption',
      h6: 'h6',
      h5: 'h5',
      h4: 'h4',
      h3: 'h3',
      h2: 'h2',
      h1: 'h1',
      custom: 'custom'
    }),
    gutterBottom: figma.boolean('Gutter Bottom')
  },
  example: ({ children, ...props }) => (
    <Typography {...props}>{children}</Typography>
  )
});
