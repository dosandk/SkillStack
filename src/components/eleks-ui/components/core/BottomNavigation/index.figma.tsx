import { BottomNavigation } from './index';
import figma from '@figma/code-connect';

figma.connect(BottomNavigation, '<FIGMA_BOTTOM_NAVIGATION>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <BottomNavigation value={0} {...props}>
      {children}
    </BottomNavigation>
  )
});

figma.connect(BottomNavigation, '<FIGMA_BOTTOM_NAVIGATION>', {
  variant: { 'Icon Only': false },
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <BottomNavigation value={0} showLabels {...props}>
      {children}
    </BottomNavigation>
  )
});
