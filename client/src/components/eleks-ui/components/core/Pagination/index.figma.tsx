import { Pagination } from './index';
import figma from '@figma/code-connect';

figma.connect(Pagination, '<FIGMA_PAGINATION>', {
  props: {
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary',
      Standard: 'standard'
    }),
    shape: figma.enum('Shape', {
      Circular: 'circular',
      Rounded: 'rounded'
    }),
    size: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Large: 'large'
    }),
    variant: figma.enum('Variant', {
      Text: 'text',
      Outlined: 'outlined'
    }),
    disabled: figma.boolean('Disabled'),
    hideNextButton: figma.boolean('Hide Next Button'),
    hidePrevButton: figma.boolean('Hide Prev Button'),
    showFirstButton: figma.boolean('Show First Button'),
    showLastButton: figma.boolean('Show Last Button')
  },
  example: props => <Pagination page={1} count={7} {...props} />
});
