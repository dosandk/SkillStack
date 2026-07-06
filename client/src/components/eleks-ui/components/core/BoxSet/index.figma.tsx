import figma from '@figma/code-connect';
import { Box } from './index';

// Connect Box Set - 1st Level (Rows 1)
figma.connect('<FIGMA_BOX_LEVEL_1_ROWS_1>', {
  variant: { Rows: '1' },
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 2
      }}
    >
      {children}
    </Box>
  )
});

// Connect Box Set - 1st Level (Columns 1)
figma.connect('<FIGMA_BOX_LEVEL_1_COLUMNS_1>', {
  variant: { Columns: '1' },
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2
      }}
    >
      {children}
    </Box>
  )
});

// Connect Box Set - 1st Level (Rows 1, Columns 1)
figma.connect('<FIGMA_BOX_LEVEL_1_ROWS_1_COLUMNS_1>', {
  variant: { Rows: '1', Columns: '1' },
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 2
      }}
    >
      {children}
    </Box>
  )
});

// Connect Box Set - 2nd Level (Rows 1)
figma.connect('<FIGMA_BOX_LEVEL_2_ROWS_1>', {
  variant: { Rows: '1' },
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 2
      }}
    >
      {children}
    </Box>
  )
});

// Connect Box Set - 2nd Level (Columns 1)
figma.connect('<FIGMA_BOX_LEVEL_2_COLUMNS_1>', {
  variant: { Columns: '1' },
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2
      }}
    >
      {children}
    </Box>
  )
});

// Connect Box Set - 2nd Level (Rows 1, Columns 1)
figma.connect('<FIGMA_BOX_LEVEL_2_ROWS_1_COLUMNS_1>', {
  variant: { Rows: '1', Columns: '1' },
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 2
      }}
    >
      {children}
    </Box>
  )
});

// Connect Box Set - 3rd Level (Rows 1)
figma.connect('<FIGMA_BOX_LEVEL_3_ROWS_1>', {
  variant: { Rows: '1' },
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 2
      }}
    >
      {children}
    </Box>
  )
});

// Connect Box Set - 3rd Level (Columns 1)
figma.connect('<FIGMA_BOX_LEVEL_3_COLUMNS_1>', {
  variant: { Columns: '1' },
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2
      }}
    >
      {children}
    </Box>
  )
});

// Connect Box Set - 3rd Level (Rows 1, Columns 1)
figma.connect('<FIGMA_BOX_LEVEL_3_ROWS_1_COLUMNS_1>', {
  variant: { Rows: '1', Columns: '1' },
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 2
      }}
    >
      {children}
    </Box>
  )
});
