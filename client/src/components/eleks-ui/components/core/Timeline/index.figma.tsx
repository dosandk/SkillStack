import { Timeline } from './index';
import figma from '@figma/code-connect';

figma.connect(Timeline, '<FIGMA_TIMELINE>', {
  props: {
    position: figma.enum('Position', {
      Left: 'left',
      Right: 'right',
      Alternating: 'alternate'
    }),
    children: figma.children('<TimelineItem>')
  },
  example: ({ children, ...props }) => (
    <Timeline {...props}>{children}</Timeline>
  )
});
