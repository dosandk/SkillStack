import { DataGrid } from './index';
import { GridColDef } from './Community/api';
import figma from '@figma/code-connect';

figma.connect(DataGrid, '<FIGMA_DATA_GRID>', {
  imports: ['import { GridColDef, DataGrid } from "@eleks-ui/components";'],
  props: {
    // These props were automatically mapped based on your linked code:
    hideFooter: figma.boolean('TableFooter?', {
      true: undefined,
      false: true
    }),
    checkboxSelection: figma.boolean('Checkbox'),
    showToolbar: figma.boolean('ToolbarFilter?'),
    toolbarFilterSearch: figma.boolean('ToolbarFilter?', {
      true: {
        toolbar: {
          showQuickFilter: true
        }
      },
      false: undefined
    }),
    density: figma.enum('Density', {
      Compact: 'compact',
      Standard: 'standard',
      Comfortable: 'comfortable'
    }),
    columnGroup1: figma.boolean('ColumnGroup #1?', {
      true: [
        {
          groupId: 'Basic info',
          children: [
            {
              groupId: 'Full name',
              children: [{ field: 'lastName' }, { field: 'firstName' }]
            },
            { field: 'age' }
          ]
        }
      ],
      false: undefined
    }),
    rowsNumber: figma.enum('Rows', {
      '5': 5,
      '10': 10
    })
  },
  example: ({
    hideFooter,
    checkboxSelection,
    showToolbar,
    toolbarFilterSearch,
    rowsNumber,
    columnGroup1,
    ...props
  }) => {
    const columns: GridColDef[] = [
      { field: 'id', headerName: 'ID', width: 90 },
      {
        field: 'firstName',
        headerName: 'First name',
        width: 150,
        editable: true
      },
      {
        field: 'lastName',
        headerName: 'Last name',
        width: 150,
        editable: true
      },
      {
        field: 'age',
        headerName: 'Age',
        type: 'number',
        width: 110,
        editable: true
      },
      {
        field: 'fullName',
        headerName: 'Full name',
        description: 'This column is calculated using firstName and lastName',
        sortable: false,
        width: 160,
        valueGetter: (_: any, row: any) =>
          (row.firstName || '') + ' ' + (row.lastName || '')
      }
    ];

    const rows = [
      { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
      { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
      { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
      { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
      { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
      { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
      { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
      { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
      { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 }
    ];

    return (
      <DataGrid
        columns={columns}
        rows={rows}
        hideFooter={hideFooter}
        checkboxSelection={checkboxSelection}
        showToolbar={showToolbar}
        slotProps={toolbarFilterSearch}
        initialState={{
          pagination: { paginationModel: { pageSize: rowsNumber } }
        }}
        columnGroupingModel={columnGroup1}
        pageSizeOptions={[5, 10, 25, { value: -1, label: 'All' }]}
        {...props}
      />
    );
  }
});
