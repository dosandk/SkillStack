import {
  Gauge as MuiGauge,
  type GaugeProps as MuiGaugeProps
} from '@mui/x-charts/Gauge';

export interface GaugeProps extends MuiGaugeProps {}

export const Gauge = ({ children, ...props }: GaugeProps) => (
  <MuiGauge {...props} />
);
