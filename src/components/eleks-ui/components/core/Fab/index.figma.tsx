import { Fab } from './index';
import figma from '@figma/code-connect';

figma.connect(Fab, '<FIGMA_FAB>', {
  props: {
    label: figma.string('Label'),
    variant: figma.enum('Variant', {
      Extended: 'extended',
      Round: 'round'
    }),
    size: figma.enum('Size', {
      Large: 'large',
      Medium: 'medium',
      Small: 'small'
    }),
    color: figma.enum('Color', {
      Default: 'default',
      Primary: 'primary',
      Secondary: 'secondary',
      Inherit: 'inherit'
    }),
    children: figma.children('*')
  },
  example: ({ children, label, ...props }) => (
    <Fab {...props}>
      {label}
      {children}
    </Fab>
  )
});
