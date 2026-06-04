import {
  DatePicker as MuiDatePicker,
  type DatePickerProps as MuiDatePickerProps,
  DesktopDatePicker as MuiDesktopDatePicker,
  type DesktopDatePickerProps as MuiDesktopDatePickerProps,
  MobileDatePicker as MuiMobileDatePicker,
  type MobileDatePickerProps as MuiMobileDatePickerProps,
  StaticDatePicker as MuiStaticDatePicker,
  type StaticDatePickerProps as MuiStaticDatePickerProps
} from '@mui/x-date-pickers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DatePickerProps extends MuiDatePickerProps<any> {}

export const DatePicker = ({ ...props }: DatePickerProps) => {
  return <MuiDatePicker {...props} />;
};

export interface DesktopDatePickerProps extends MuiDesktopDatePickerProps<any> {}

export const DesktopDatePicker = ({ ...props }: DesktopDatePickerProps) => {
  return <MuiDesktopDatePicker {...props} />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MobileDatePickerProps extends MuiMobileDatePickerProps<any> {}

export const MobileDatePicker = ({ ...props }: MobileDatePickerProps) => {
  return <MuiMobileDatePicker {...props} />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface StaticDatePickerProps extends MuiStaticDatePickerProps<any> {}

export const StaticDatePicker = ({ ...props }: StaticDatePickerProps) => {
  return <MuiStaticDatePicker {...props} />;
};
