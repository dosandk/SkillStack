import figma from '@figma/code-connect';

import { AddCircleOutlineOutlined } from '../../../icons/Math/AddCircleOutlineOutlined';
import { SpeedDialAction, SpeedDialIcon } from './api/index';
import { SpeedDial } from './index';

figma.connect(SpeedDial, '<FIGMA_SPEED_DIAL>', {
  props: {
    direction: figma.enum('Direction', {
      Up: 'up',
      Down: 'down',
      Left: 'left',
      Right: 'right'
    }),
    children: figma.children(['<SpeedDialItem>'])
  },
  example: ({ children, ...props }) => (
    <SpeedDial
      {...props}
      open
      ariaLabel="SpeedDial example"
      icon={<SpeedDialIcon />}
    >
      {children}
    </SpeedDial>
  )
});

// NOTE: this is <SpeedDialItem> component
figma.connect('<FIGMA_SPEED_DIAL_ITEM>', {
  props: {
    children: figma.children('*')
  },
  example: ({ ...props }) => {
    return <SpeedDialAction {...props} icon={<AddCircleOutlineOutlined />} />;
  }
});
