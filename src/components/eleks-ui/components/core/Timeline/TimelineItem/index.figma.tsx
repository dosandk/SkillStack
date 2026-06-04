import { TimelineItem } from './index';
import { TimelineSeparator } from '../TimelineSeparator/index';
import { TimelineConnector } from '../TimelineConnector/index';
import { TimelineContent } from '../TimelineContent/index';
import { TimelineOppositeContent } from '../TimelineOppositeContent/index';
import figma from '@figma/code-connect';

figma.connect(TimelineItem, '<FIGMA_TIMELINE_ITEM>', {
  props: {
    position: figma.enum('Position', {
      Left: 'right',
      Right: 'left'
    }),
    children: figma.children('<TimelineDot>'),
    opposing: figma.boolean('Opposing', {
      true: (
        <TimelineOppositeContent color="text.secondary">
          Opposing
        </TimelineOppositeContent>
      )
    })
  },
  example: ({ children, opposing, ...props }) => (
    <TimelineItem {...props}>
      {opposing}
      <TimelineSeparator>
        {children}
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent>Main</TimelineContent>
    </TimelineItem>
  )
});
