import { TableCell } from './index';
import figma from '@figma/code-connect';

figma.connect(TableCell, '<FIGMA_TABLE_TABLE_CELL>', {
  props: {
    // No matching props could be found for these Figma properties:
    // "2ndInstance": figma.boolean('2nd Instance?'),
    // "2ndInstance": figma.instance('↳ 2nd Instance'),
    // "instance": figma.instance('Instance'),
    // "small": figma.boolean('Small'),
    // "checkbox": figma.boolean('Checkbox')
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <TableCell {...props}>{children}</TableCell>
  )
});
