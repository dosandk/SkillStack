import figma from '@figma/code-connect';
import { Heading } from './index';

// NOTE: _Custom / Page Heading
figma.connect('<FIGMA_PAGE_HEADING>', {
  props: {
    breadcrumbs: figma.children('<Breadcrumbs>'),
    actionsBottom: figma.children('<Stack>'),
    title: 'Page heading',
    subtitle: 'Subtitle text',
    divider: figma.boolean('Divider'),
    main: figma.nestedProps('Box Set - 3rd Level', {
      actions: figma.children('<Stack>')
    })
  },
  example: ({ breadcrumbs, actionsBottom, main, title, subtitle, divider }) => (
    <Heading
      variant="page"
      title={title}
      subtitle={subtitle}
      actions={main.actions}
      breadcrumbs={breadcrumbs}
      actionsBottom={actionsBottom}
      divider={divider}
    />
  )
});

// NOTE: _Custom / Section Headings
figma.connect('<FIGMA_SECTION_HEADING>', {
  props: {
    actionsBottom: figma.children('<Stack>'),
    title: 'Section heading',
    subtitle: 'Section subtitle',
    divider: figma.boolean('Divider'),
    main: figma.nestedProps('Box Set - 3rd Level', {
      actions: figma.children('<Stack>')
    })
  },
  example: ({ actionsBottom, main, title, subtitle, divider }) => (
    <Heading
      variant="section"
      title={title}
      subtitle={subtitle}
      actions={main.actions}
      actionsBottom={actionsBottom}
      divider={divider}
    />
  )
});
