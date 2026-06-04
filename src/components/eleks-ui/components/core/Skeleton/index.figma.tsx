import { Skeleton } from './index';
import figma from '@figma/code-connect';

figma.connect(Skeleton, '<FIGMA_SKELETON>', {
  props: {
    // No matching props could be found for these Figma properties:
    shape: figma.enum('Shape', {
      Text: 'text',
      Circle: 'circle',
      Rectangle: 'rectangle'
    }),
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <Skeleton {...props}>{children}</Skeleton>
  )
});
