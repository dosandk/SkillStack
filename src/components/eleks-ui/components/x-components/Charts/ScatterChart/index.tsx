import {
  ScatterChart as MuiScatterChart,
  type ScatterChartProps as MuiScatterChartProps
} from '@mui/x-charts/ScatterChart';

export interface ScatterChartProps extends MuiScatterChartProps {}

export const ScatterChart = ({ children, ...props }: ScatterChartProps) => (
  <MuiScatterChart {...props} />
);
