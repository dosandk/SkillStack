import {
  PieChart as MuiPieChart,
  type PieChartProps as MuiPieChartProps
} from '@mui/x-charts/PieChart';

export interface PieChartProps extends MuiPieChartProps {}

export const PieChart = ({ children, ...props }: PieChartProps) => (
  <MuiPieChart {...props} />
);
