import {
  BarChart as MuiBarChart,
  type BarChartProps as MuiBarChartProps
} from '@mui/x-charts/BarChart';

export interface BarChartProps extends MuiBarChartProps {}

export const BarChart = ({ children, ...props }: BarChartProps) => (
  <MuiBarChart {...props} />
);
