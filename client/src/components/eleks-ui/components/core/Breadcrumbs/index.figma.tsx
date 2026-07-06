import { Breadcrumbs } from './index';
import figma from '@figma/code-connect';

figma.connect(Breadcrumbs, '<FIGMA_BREADCRUMBS>', {
  props: {
    separator: figma.enum('Separator', {
      'Text*': '/',
      Icon: figma.instance('Separator Icon')
    }),
    maxItems: figma.boolean('Collapsed', {
      true: 2,
      false: undefined
    }),
    children: figma.children('<Link>')
  },
  example: ({ children, ...props }) => (
    <Breadcrumbs {...props}>{children}</Breadcrumbs>
  )
});
