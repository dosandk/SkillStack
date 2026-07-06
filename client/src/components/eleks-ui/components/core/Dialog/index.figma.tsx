import figma from '@figma/code-connect';
import { Dialog, DialogActions, DialogContent, DialogTitle } from './index';

figma.connect(DialogTitle, '<FIGMA_DIALOG_TITLE>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <DialogTitle {...props}>{children}</DialogTitle>
  )
});

figma.connect(DialogContent, '<FIGMA_DIALOG_CONTENT>', {
  props: {
    dividers: figma.boolean('Dividers?'),
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <DialogContent {...props}>{children}</DialogContent>
  )
});

figma.connect(DialogActions, '<FIGMA_DIALOG_ACTIONS>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <DialogActions {...props}>{children}</DialogActions>
  )
});

// NOTE: this is DialogElements
figma.connect('<FIGMA_DIALOG_ELEMENTS>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => <>{children}</>
});

figma.connect(Dialog, '<FIGMA_DIALOG>', {
  props: {
    maxWidth: figma.enum('Max Width', {
      xs: 'xs',
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl'
    }),
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <Dialog open onClose={() => {}} {...props}>
      {children}
    </Dialog>
  )
});
