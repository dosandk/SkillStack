import {
  DataGridPremium as MuiDataGridPremium,
  type DataGridPremiumProps as MuiDataGridPremiumProps
} from '@mui/x-data-grid-premium';

export interface DataGridPremiumProps extends MuiDataGridPremiumProps {}

export const DataGridPremium = ({ ...props }: DataGridPremiumProps) => {
  return <MuiDataGridPremium {...props} />;
};
