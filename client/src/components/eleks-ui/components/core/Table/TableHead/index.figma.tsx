import { TableHead } from './index';
import figma from '@figma/code-connect';

figma.connect(TableHead, '<FIGMA_TABLE_TABLE_HEAD>', {
  props: {
    // No matching props could be found for these Figma properties:
    // "label": figma.string('Label'),
    // "rightSort": figma.boolean('Right Sort'),
    // "leftSort": figma.boolean('Left Sort'),
    // "small": figma.boolean('Small'),
    // "checkbox": figma.boolean('Checkbox')
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <TableHead {...props}>{children}</TableHead>
  )
});
