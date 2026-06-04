import {
  DataGrid as MuiDataGrid,
  type DataGridProps as MuiDataGridProps
} from '@mui/x-data-grid';

export interface DataGridProps extends MuiDataGridProps {}

export const DataGrid = ({ ...props }: DataGridProps) => {
  return <MuiDataGrid {...props} />;
};
