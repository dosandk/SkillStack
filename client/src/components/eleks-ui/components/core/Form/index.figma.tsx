import figma from '@figma/code-connect';
import { Form } from './index';

// NOTE: _Custom / Forms / Single Column
figma.connect('<FIGMA_CUSTOM_FORMS_SINGLE_COLUMN>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => <Form>{children}</Form>
});

// NOTE: _Custom / Forms / Double Column
figma.connect('<FIGMA_CUSTOM_FORMS_DOUBLE_COLUMN>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => <Form>{children}</Form>
});

// NOTE: _Custom / Forms / Email & Password
figma.connect('<FIGMA_CUSTOM_FORMS_EMAIL_PASSWORD>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => <Form>{children}</Form>
});

// NOTE: _Custom / Forms / Passwordless
figma.connect('<FIGMA_CUSTOM_FORMS_EMAIL_PASSWORDLESS>', {
  props: {
    children: figma.children('*')
  },
  example: ({ children }) => <Form>{children}</Form>
});
