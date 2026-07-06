import { TableRow } from './index';
import figma from '@figma/code-connect';

// NOTE: TableCellRow component
figma.connect(TableRow, '<FIGMA_TABLE_TABLE_CELL_ROW>', {
  props: {
    // No matching props could be found for these Figma properties:
    // "small": figma.boolean('Small'),
    // "checkbox": figma.boolean('Checkbox'),
    // "hover": figma.boolean('Hover'),
    // "selected": figma.boolean('Selected'),
    // "columns": figma.enum('Columns', {
    //   "3": "3",
    //   "4": "4",
    //   "5": "5",
    //   "6": "6",
    //   "8": "8",
    //   "10": "10"
    // }),
    // "divider": figma.boolean('Divider')
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <TableRow {...props}>{children}</TableRow>
  )
});

// NOTE: TableHeadRow Component
figma.connect(TableRow, '<FIGMA_TABLE_TABLE_HEAD_ROW>', {
  props: {
    // No matching props could be found for these Figma properties:
    // "small": figma.boolean('Small'),
    // "checkbox": figma.boolean('Checkbox'),
    // "selected": figma.boolean('Selected'),
    // "columns": figma.enum('Columns', {
    //   "3": "3",
    //   "4": "4",
    //   "5": "5",
    //   "6": "6",
    //   "8": "8",
    //   "10": "10"
    // })
    //
    children: figma.children('*')
  },
  example: ({ children, ...props }) => (
    <TableRow {...props}>{children}</TableRow>
  )
});
