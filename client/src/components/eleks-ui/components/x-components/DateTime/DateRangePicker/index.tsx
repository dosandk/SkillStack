import {
  DateRangePicker as MuiDateRangePicker,
  type DateRangePickerProps as MuiDateRangePickerProps,
  DesktopDateRangePicker as MuiDesktopDateRangePicker,
  type DesktopDateRangePickerProps as MuiDesktopDateRangePickerProps,
  MobileDateRangePicker as MuiMobileDateRangePicker,
  type MobileDateRangePickerProps as MuiMobileDateRangePickerProps,
  StaticDateRangePicker as MuiStaticDateRangePicker,
  type StaticDateRangePickerProps as MuiStaticDateRangePickerProps
} from '@mui/x-date-pickers-pro';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DateRangePickerProps extends MuiDateRangePickerProps<any> {}

export const DateRangePicker = ({ ...props }: DateRangePickerProps) => {
  return <MuiDateRangePicker {...props} />;
};

export interface DesktopDateRangePickerProps extends MuiDesktopDateRangePickerProps<any> {}

export const DesktopDateRangePicker = ({
  ...props
}: DesktopDateRangePickerProps) => {
  return <MuiDesktopDateRangePicker {...props} />;
};

export interface MobileDateRangePickerProps extends MuiMobileDateRangePickerProps<any> {}

export const MobileDateRangePicker = ({
  ...props
}: MobileDateRangePickerProps) => {
  return <MuiMobileDateRangePicker {...props} />;
};

export interface StaticDateRangePickerProps extends MuiStaticDateRangePickerProps<any> {}

export const StaticDateRangePicker = ({
  ...props
}: StaticDateRangePickerProps) => {
  return <MuiStaticDateRangePicker {...props} />;
};
