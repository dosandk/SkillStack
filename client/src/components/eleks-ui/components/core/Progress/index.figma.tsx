import figma from '@figma/code-connect';

import { Box } from '../BoxSet';
import { Typography } from '../Typography';
import { CircularProgress, LinearProgress } from './index';

figma.connect(CircularProgress, '<FIGMA_PROGRESS_CIRCULAR>', {
  props: {
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary',
      Inherit: 'inherit'
    }),
    size: figma.enum('Size', {
      '32px': '32px',
      '16px': '16px'
    })
  },
  example: props => <CircularProgress {...props} />
});

figma.connect(CircularProgress, '<FIGMA_PROGRESS_CIRCULAR>', {
  variant: {
    Label: true,
    Size: '32px'
  },
  props: {
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary',
      Inherit: 'inherit'
    }),
    size: figma.enum('Size', {
      '32px': '32px',
      '16px': '16px'
    }),
    label: figma.children('<Typography>')
  },
  example: ({ label, ...props }) => {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress {...props} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {label}
        </Box>
      </Box>
    );
  }
});

figma.connect(LinearProgress, '<FIGMA_PROGRESS_LINEAR>', {
  props: {
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary',
      Inherit: 'inherit'
    }),
    type: figma.enum('Type', {
      Determinate: 'determinate',
      Buffer: 'buffer',
      Indeterminate: 'indeterminate'
    })
  },
  example: ({ type, ...props }) => (
    <LinearProgress value={60} valueBuffer={80} variant={type} {...props} />
  )
});

figma.connect(LinearProgress, '<FIGMA_PROGRESS_LINEAR>', {
  variant: {
    Label: true
  },
  props: {
    color: figma.enum('Color', {
      Primary: 'primary',
      Secondary: 'secondary',
      Inherit: 'inherit'
    }),
    type: figma.enum('Type', {
      Determinate: 'determinate',
      Buffer: 'buffer',
      Indeterminate: 'indeterminate'
    })
  },
  example: ({ type, ...props }) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress
            value={60}
            valueBuffer={80}
            variant={type}
            {...props}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            99%
          </Typography>
        </Box>
      </Box>
    );
  }
});
