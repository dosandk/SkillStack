import {
  LocalizationProvider as MuiLocalizationProvider,
  PickersDay as MuiPickersDay,
  type PickersDayProps as MuiPickersDayProps,
  DayCalendarSkeleton as MuiDayCalendarSkeleton
} from '@mui/x-date-pickers';
import { AdapterDayjs as MuiAdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import {
  renderTimeViewClock as MuiRenderTimeViewClock,
  renderMultiSectionDigitalClockTimeView as MuiRenderMultiSectionDigitalClockTimeView
} from '@mui/x-date-pickers/timeViewRenderers';

export const LocalizationProvider = MuiLocalizationProvider;
export const renderTimeViewClock = MuiRenderTimeViewClock;
export const renderMultiSectionDigitalClockTimeView =
  MuiRenderMultiSectionDigitalClockTimeView;
export const AdapterDayjs = MuiAdapterDayjs;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PickersDayProps extends MuiPickersDayProps<any> {}

export const PickersDay = ({ ...props }: PickersDayProps) => {
  return <MuiPickersDay {...props} />;
};

export const DayCalendarSkeleton = ({ ...props }) => {
  return <MuiDayCalendarSkeleton {...props} />;
};
