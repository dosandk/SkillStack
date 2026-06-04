import figma from '@figma/code-connect';
import { Link } from './index';

figma.connect(Link, '<FIGMA_LINK>', {
  props: {
    color: figma.enum('Color', {
      Primary: 'primary',
      Inherit: 'inherit'
    }),
    underline: figma.enum('Underline', {
      Always: 'always',
      Hover: 'hover',
      None: 'none'
    }),
    state: figma.enum('State', {
      Enabled: 'enabled',
      Hovered: 'hovered',
      Focused: 'focused'
    }),
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <Link href="#" sx={{ display: 'flex', alignItems: 'center' }} {...props}>
      {children}
    </Link>
  )
});
