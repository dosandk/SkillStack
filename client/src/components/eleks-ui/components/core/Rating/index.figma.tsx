import figma from '@figma/code-connect';
import { Rating } from './index';

figma.connect(Rating, '<FIGMA_RATING>', {
  props: {
    size: figma.enum('Size', {
      Small: 'small',
      'Medium*': 'medium',
      Large: 'large'
    }),
    disabled: figma.boolean('Disabled')
  },
  example: props => <Rating {...props} precision={0.5} value={3.5} />
});
