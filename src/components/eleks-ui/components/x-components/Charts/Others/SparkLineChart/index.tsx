import {
  SparkLineChart as MuiSparkLineChart,
  type SparkLineChartProps as MuiSparkLineChartProps
} from '@mui/x-charts/SparkLineChart';

export interface SparkLineChartProps extends MuiSparkLineChartProps {}

export const SparkLineChart = (props: SparkLineChartProps) => (
  <MuiSparkLineChart {...props} />
);
