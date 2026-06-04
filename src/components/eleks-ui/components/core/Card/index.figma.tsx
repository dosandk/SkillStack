import { Card } from './index';
import { CardHeader } from './CardHeader/index';
import { CardContent } from './CardContent/index';
import { CardActions } from './CardActions/index';
import { CardMedia } from './CardMedia/index';
import figma from '@figma/code-connect';

figma.connect(Card, '<FIGMA_CARD_HEADER>', {
  props: {
    title: figma.string('Header'),
    subheader: figma.boolean('Subheader?', {
      true: figma.string('↳ Value'),
      false: undefined
    }),
    avatar: figma.boolean('Avatar', {
      true: figma.children('<Avatar>'),
      false: undefined
    }),
    action: figma.boolean('Right Action?', {
      true: figma.instance('↳ Instance'),
      false: undefined
    })
  },
  example: ({ ...props }) => <CardHeader {...props} />
});

figma.connect(Card, '<FIGMA_CARD_CONTENT>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <CardContent {...props}>{children}</CardContent>
  )
});

figma.connect(Card, '<FIGMA_CARD_ACTIONS>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <CardActions {...props}>{children}</CardActions>
  )
});

figma.connect(Card, '<FIGMA_CARD_MEDIA>', {
  props: {
    component: 'img',
    image: 'link/to/image.jpg',
    sx: { height: '140' },
    title: 'Image alt text'
  },
  example: ({ sx, ...props }) => <CardMedia sx={sx} {...props} />
});

figma.connect(Card, '<FIGMA_CARD>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children, ...props }) => <Card {...props}>{children}</Card>
});

// NOTE: this is CardElements
figma.connect('<FIGMA_CARD_CARD_ELEMENT>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => <>{children}</>
});
