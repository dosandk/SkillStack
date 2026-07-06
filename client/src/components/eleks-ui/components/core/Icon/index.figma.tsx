import { Icon } from './index';
import figma from '@figma/code-connect';

figma.connect('<FIGMA_ICON>', {
  variant: {
    Type: 'SVG Icon'
  },
  props: {
    icon: figma.instance('Icon Instance')
  },
  example: ({ icon }) => <>{icon}</>
});

figma.connect(Icon, '<FIGMA_ICON>', {
  variant: {
    Type: 'Font Icon'
  },
  props: {
    fontSize: figma.enum('Size', {
      Small: 'small',
      Medium: 'medium',
      Large: 'large'
    }),
    label: figma.textContent('Material Icons')
  },
  example: ({ label, ...props }) => <Icon {...props}>{label}</Icon>
});
