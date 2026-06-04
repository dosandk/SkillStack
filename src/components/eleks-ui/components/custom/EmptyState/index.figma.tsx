import { Box } from '../../core/BoxSet';
import figma from '@figma/code-connect';

import {
  NoDataState,
  Page404State,
  NoAccessState,
  Page401State,
  ErrorState,
  NoResultState,
  NoConnectionState,
  SelectState,
  LoaderState
} from './index';

figma.connect('<FIGMA_EMPTY_STATE>', {
  variant: {
    Image: 'No Data'
  },
  example: () => {
    return (
      <Box
        sx={{
          width: '400px',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <NoDataState />
      </Box>
    );
  }
});

figma.connect('<FIGMA_EMPTY_STATE>', {
  variant: {
    Image: 'Filter and search'
  },
  props: {
    showDescription: figma.boolean('Description')
  },
  example: ({ showDescription } = {}) => {
    const description = showDescription
      ? "Try adjusting your search or filter options to find what you're looking for"
      : '';

    return (
      <Box
        sx={{
          width: '400px',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <NoResultState description={description} />
      </Box>
    );
  }
});

figma.connect('<FIGMA_EMPTY_STATE>', {
  variant: {
    Image: '404'
  },
  props: {
    showDescription: figma.boolean('Description')
  },
  example: ({ showDescription }) => {
    const description = showDescription
      ? 'Go back, or head over to the starting page to choose a new direction'
      : '';

    return (
      <Box
        sx={{
          width: '400px',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <Page404State description={description} />
      </Box>
    );
  }
});

figma.connect('<FIGMA_EMPTY_STATE>', {
  variant: {
    Image: 'No internet connection'
  },
  props: {
    description: figma.boolean('Description')
  },
  example: ({ showDescription }) => {
    const description = showDescription
      ? 'You are offline. Please check your network connection'
      : '';

    return (
      <Box
        sx={{
          width: '400px',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <NoConnectionState description={description} />
      </Box>
    );
  }
});

figma.connect('<FIGMA_EMPTY_STATE>', {
  variant: {
    Image: 'No permission'
  },
  props: {
    description: figma.boolean('Description')
  },
  example: ({ showDescription }) => {
    const description = showDescription
      ? 'You don’t have permission to view this page'
      : '';

    return (
      <Box
        sx={{
          width: '400px',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <NoAccessState description={description} />
      </Box>
    );
  }
});

figma.connect('<FIGMA_EMPTY_STATE>', {
  variant: {
    Image: 'Select to show'
  },
  props: {
    description: figma.boolean('Description')
  },
  example: ({ showDescription }) => {
    const description = showDescription
      ? 'You don’t have permission to this page'
      : '';

    return (
      <Box
        sx={{
          width: '400px',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <SelectState description={description} />
      </Box>
    );
  }
});

figma.connect('<FIGMA_EMPTY_STATE>', {
  variant: {
    Image: '401'
  },
  props: {
    description: figma.boolean('Description')
  },
  example: ({ showDescription }) => {
    const description = showDescription
      ? 'Try refreshing the page and fill in the correct login details'
      : '';

    return (
      <Box
        sx={{
          width: '400px',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <Page401State description={description} />
      </Box>
    );
  }
});

figma.connect('<FIGMA_EMPTY_STATE>', {
  variant: {
    Image: 'Loader'
  },
  example: () => {
    return (
      <Box
        sx={{
          width: '400px',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <LoaderState />
      </Box>
    );
  }
});

figma.connect('<FIGMA_EMPTY_STATE>', {
  variant: {
    Image: 'Sorry'
  },
  props: {
    description: figma.boolean('Description')
  },
  example: ({ showDescription }) => {
    const description = showDescription ? 'Please reload the page' : '';

    return (
      <Box
        sx={{
          width: '400px',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <ErrorState description={description} />
      </Box>
    );
  }
});
