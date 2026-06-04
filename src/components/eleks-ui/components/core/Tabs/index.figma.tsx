import * as React from 'react';
import { Tabs } from './index';
import { Box } from '../BoxSet';
import figma from '@figma/code-connect';

figma.connect(Tabs, '<FIGMA_TABS_GROUP>', {
  variant: {
    Orientation: 'Horizontal'
  },
  props: {
    variant: figma.enum('Variant', {
      Standard: 'standard',
      Scrollable: 'scrollable',
      'Full Width': 'fullWidth'
    }),
    children: figma.children('<Tab>'),
    visibleScrollbar: figma.boolean('Scroll Visible')
  },
  example: ({ children, ...props }) => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    };

    return (
      <Box sx={{ display: 'flex', width: 300 }}>
        <Tabs
          orientation="horizontal"
          value={value}
          onChange={handleChange}
          {...props}
        >
          {children}
        </Tabs>
      </Box>
    );
  }
});

figma.connect(Tabs, '<FIGMA_TABS_GROUP>', {
  variant: {
    Orientation: 'Vertical'
  },
  props: {
    variant: figma.enum('Variant', {
      Standard: 'standard',
      Scrollable: 'scrollable',
      'Full Width': 'fullWidth'
    }),
    children: figma.children('<Tab>'),
    visibleScrollbar: figma.boolean('Scroll Visible')
  },
  example: ({ children, ...props }) => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    };

    return (
      <Box sx={{ display: 'flex', height: 300 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          orientation="vertical"
          {...props}
        >
          {children}
        </Tabs>
      </Box>
    );
  }
});
