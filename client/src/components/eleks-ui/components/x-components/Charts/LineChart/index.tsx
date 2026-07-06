import {
  LineChart as MuiLineChart,
  type LineChartProps as MuiLineChartProps
} from '@mui/x-charts/LineChart';

export interface LineChartProps extends MuiLineChartProps {}

export const LineChart = ({ children, ...props }: LineChartProps) => (
  <MuiLineChart {...props} />
);
