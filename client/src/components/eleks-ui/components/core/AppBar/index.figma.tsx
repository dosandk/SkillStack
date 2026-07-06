import React from 'react';
import { AppBar } from './index';
import figma from '@figma/code-connect';

figma.connect(AppBar, '<FIGMA_APPBAR>', {
  props: {
    color: figma.enum('Color', {
      'Inherit White': 'inherit',
      Primary: 'primary',
      Secondary: 'secondary',
      Default: 'default',
      Transparent: 'transparent'
    }),
    // TODO: implement this
    // children: figma.children(["Paper", "Toolbar", "IconButton", "Icon", "Typography", "Stack"]),
    children: figma.children('*')
  },
  example: ({ children, ...props }) => <AppBar {...props}>{children}</AppBar>
});
