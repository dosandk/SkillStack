import { TablePagination } from '../index';
import { TableFooter } from './index';
import figma from '@figma/code-connect';

figma.connect(TableFooter, '<FIGMA_TABLE_TABLE_FOOTER>', {
  props: {
    // children: figma.children('*')
  },
  example: ({ ...props }) => (
    <TableFooter {...props}>
      <TablePagination
        rowsPerPageOptions={[2, 5]}
        count={100}
        rowsPerPage={2}
        page={1}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
      />
    </TableFooter>
  )
});
