import { AvatarGroup } from '../AvatarGroup';
import figma from '@figma/code-connect';

figma.connect(AvatarGroup, '<FIGMA_AVATAR_GROUP>', {
  props: {
    spacing: figma.enum('Spacing', {
      Medium: 'medium',
      Small: 'small'
    }),
    max: figma.enum('Max', {
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5
    }),
    size: figma.enum('Size', {
      '40px': '40px',
      '32px': '32px',
      '24px': '24px'
    }),
    children: figma.children('*')
  },
  // NOTE: no need to use {...props} on the AvatarGroup
  example: ({ children, max, spacing }) => (
    <AvatarGroup max={max} spacing={spacing}>
      {children}
    </AvatarGroup>
  )
});
