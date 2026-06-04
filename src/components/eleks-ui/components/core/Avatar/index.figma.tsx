import figma from '@figma/code-connect';
import { Badge } from '../Badge';
import { Avatar } from './index';

const sharedBadgeProps = {
  badgeProps: figma.nestedProps('<Badge>', {
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary',
      Error: 'error',
      Info: 'info',
      Success: 'success',
      Warning: 'warning'
    }),
    variant: figma.enum('Variant', {
      Standard: 'standard',
      Dot: 'dot'
    }),
    badgeContent: figma.string('Content')
  })
};

const sharedAvatarProps = {
  variant: figma.enum('Variant', {
    Circular: 'circular',
    Rounded: 'rounded',
    Square: 'square'
  }),
  alt: figma.string('Initials'),
  initials: figma.string('Initials'),
  size: figma.enum('Size', {
    '40px': '40px',
    '32px': '32px',
    '24px': '24px',
    '18px': '18px'
  })
};

figma.connect(Avatar, '<FIGMA_AVATAR>', {
  variant: { Content: 'Text' },
  props: {
    ...sharedAvatarProps
  },
  example: ({ initials, ...props }) => <Avatar {...props}>{initials}</Avatar>
});

figma.connect(Avatar, '<FIGMA_AVATAR>', {
  variant: { Content: 'Icon' },
  props: {
    ...sharedAvatarProps,
    children: figma.children('<Icon>')
  },
  example: ({ children, ...props }) => <Avatar {...props}>{children}</Avatar>
});

figma.connect(Avatar, '<FIGMA_AVATAR>', {
  variant: { Content: 'Image' },
  props: {
    ...sharedAvatarProps,
    children: figma.children('*')
  },
  example: ({ ...props }) => <Avatar {...props} src="#" />
});

figma.connect(Avatar, '<FIGMA_AVATAR>', {
  variant: { Badge: true, Content: 'Text' },
  props: {
    ...sharedAvatarProps,
    ...sharedBadgeProps
  },
  example: ({ badgeProps, initials, alt, variant, ...props }) => {
    return (
      <Badge
        color={badgeProps.color}
        variant={badgeProps.variant}
        badgeContent={badgeProps.badgeContent}
      >
        <Avatar alt={alt} variant={variant} {...props}>
          {initials}
        </Avatar>
      </Badge>
    );
  }
});

figma.connect(Avatar, '<FIGMA_AVATAR>', {
  variant: { Badge: true, Content: 'Icon' },
  props: {
    ...sharedAvatarProps,
    ...sharedBadgeProps,
    children: figma.children('<Icon>')
  },
  example: ({ children, badgeProps, alt, variant, ...props }) => {
    return (
      <Badge
        color={badgeProps.color}
        variant={badgeProps.variant}
        badgeContent={badgeProps.badgeContent}
      >
        <Avatar alt={alt} variant={variant} {...props}>
          {children}
        </Avatar>
      </Badge>
    );
  }
});

figma.connect(Avatar, '<FIGMA_AVATAR>', {
  variant: { Badge: true, Content: 'Image' },
  props: {
    ...sharedAvatarProps,
    ...sharedBadgeProps
  },
  example: ({ badgeProps, alt, variant, ...props }) => {
    return (
      <Badge
        color={badgeProps.color}
        variant={badgeProps.variant}
        badgeContent={badgeProps.badgeContent}
      >
        <Avatar alt={alt} variant={variant} {...props} src="#" />
      </Badge>
    );
  }
});
