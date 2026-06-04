import figma from '@figma/code-connect';
import { Table } from './index';

figma.connect(Table, '<FIGMA_TABLE>', {
  props: {
    // No matching props could be found for these Figma properties:
    // "tableFooter": figma.boolean('TableFooter?'),
    // "small": figma.boolean('Small'),
    // "checkbox": figma.boolean('Checkbox'),
    // "smallScreen": figma.boolean('Small Screen'),
    // "rows": figma.enum('Rows', {
    //   "5": "5",
    //   "10": "10"
    // })
    children: figma.children('*')
  },
  example: ({ children, ...props }) => <Table {...props}>{children}</Table>
});
