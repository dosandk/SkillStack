import figma from '@figma/code-connect';
import { Divider } from './index';

figma.connect(Divider, '<FIGMA_DIVIDER_VERTICAL>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <Divider orientation="vertical" {...props}>
      {children}
    </Divider>
  )
});

figma.connect(Divider, '<FIGMA_DIVIDER_HORIZONTAL>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => <Divider {...props}>{children}</Divider>
});
