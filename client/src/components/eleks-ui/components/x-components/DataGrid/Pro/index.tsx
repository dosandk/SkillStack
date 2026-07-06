import {
  DataGridPro as MuiDataGridPro,
  type DataGridProProps as MuiDataGridProProps
} from '@mui/x-data-grid-pro';

export interface DataGridProProps extends MuiDataGridProProps {}

export const DataGridPro = ({ ...props }: DataGridProProps) => {
  return <MuiDataGridPro {...props} />;
};
