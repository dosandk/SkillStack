import figma from '@figma/code-connect';
import { Container } from './index';

figma.connect(Container, '<FIGMA_CONTAINER>', {
  props: {
    // These props were automatically mapped based on your linked code:
    disableGutters: figma.boolean('Dis. Gutters'),
    maxWidth: figma.enum('Max Width', {
      'Extra Small': 'xs',
      Small: 'sm',
      Medium: 'md',
      Large: 'lg',
      'Extra Large': 'xl'
    }),
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <Container {...props}>{children}</Container>
  )
});
