import figma from '@figma/code-connect';
import { FileUploadDropzone, FileUploadItem, FileUpload } from './index';

// NOTE: _Custom / Uploader / Container
figma.connect('<FIGMA_CUSTOM_UPLOADER_CONTAINER>', {
  variant: {
    State: 'Resting'
  },
  props: {},
  example: () => <FileUploadDropzone state="default" />
});

// // NOTE: _Custom / Uploader / Container
figma.connect('<FIGMA_CUSTOM_UPLOADER_CONTAINER>', {
  variant: {
    State: 'Hover'
  },
  props: {},
  example: () => <FileUploadDropzone state="active" />
});

// // NOTE: _Custom / Uploader / Container
figma.connect('<FIGMA_CUSTOM_UPLOADER_CONTAINER>', {
  variant: {
    State: 'Failure'
  },
  props: {},
  example: () => <FileUploadDropzone state="error" />
});

// NOTE: _Custom / Uploader / Item / State: Complete, Loading: Linear
figma.connect('<FIGMA_CUSTOM_UPLOADER_ITEM>', {
  variant: {
    State: 'Complete',
    Loading: 'Linear'
  },
  props: {},
  example: () => (
    <FileUploadItem
      file={{
        name: 'document_file_name.pdf',
        size: '100kb',
        isLoading: false,
        progress: 100
      }}
      loadingType="linear"
    />
  )
});

// NOTE: _Custom / Uploader / Item / State: Complete, Loading: Circle
figma.connect('<FIGMA_CUSTOM_UPLOADER_ITEM>', {
  variant: {
    State: 'Complete',
    Loading: 'Circle'
  },
  props: {},
  example: () => (
    <FileUploadItem
      file={{
        name: 'document_file_name.pdf',
        size: '100kb',
        isLoading: false,
        progress: 100
      }}
      loadingType="circular"
    />
  )
});

// NOTE: _Custom / Uploader / Item / State: Failed, Loading: Circle
figma.connect('<FIGMA_CUSTOM_UPLOADER_ITEM>', {
  variant: {
    State: 'Failed',
    Loading: 'Circle'
  },
  props: {},
  example: () => (
    <FileUploadItem
      file={{
        name: 'document_file_name.pdf',
        size: '100kb',
        isLoading: false,
        error: 'File too large'
      }}
      loadingType="circular"
    />
  )
});

// NOTE: _Custom / Uploader / Item / State: Failed, Loading: Linear
figma.connect('<FIGMA_CUSTOM_UPLOADER_ITEM>', {
  variant: {
    State: 'Failed',
    Loading: 'Linear'
  },
  props: {},
  example: () => (
    <FileUploadItem
      file={{
        name: 'document_file_name.pdf',
        size: '100kb',
        isLoading: false,
        error: 'File too large'
      }}
      loadingType="linear"
    />
  )
});

// NOTE: _Custom / Uploader / Item / State: Uploading, Loading: Circle
figma.connect('<FIGMA_CUSTOM_UPLOADER_ITEM>', {
  variant: {
    State: 'Uploading',
    Loading: 'Circle'
  },
  props: {},
  example: () => (
    <FileUploadItem
      file={{
        name: 'document_file_name.pdf',
        size: '100kb',
        isLoading: true,
        progress: 40
      }}
      loadingType="circular"
    />
  )
});

// NOTE: _Custom / Uploader / Item / State: Uploading, Loading: Linear
figma.connect('<FIGMA_CUSTOM_UPLOADER_ITEM>', {
  variant: {
    State: 'Uploading',
    Loading: 'Linear'
  },
  props: {},
  example: () => (
    <FileUploadItem
      file={{
        name: 'document_file_name.pdf',
        size: '100kb',
        isLoading: true,
        progress: 40
      }}
      loadingType="linear"
    />
  )
});

// NOTE: _Custom / Uploader / File Upload
figma.connect('<FIGMA_CUSTOM_UPLOADER_FILE_UPLOAD>', {
  props: {},
  example: () => (
    <FileUpload
      files={[
        {
          name: 'document_file_name.pdf',
          size: '100kb',
          isLoading: true,
          progress: 40
        },
        {
          name: 'document_file_name.pdf',
          size: '100kb',
          isLoading: false,
          progress: 100
        },
        {
          name: 'document_file_name.pdf',
          size: '100kb',
          isLoading: false,
          error: 'File too large'
        }
      ]}
    />
  )
});
