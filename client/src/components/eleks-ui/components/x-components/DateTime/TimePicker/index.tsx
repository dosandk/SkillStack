import {
  TimePicker as MuiTimePicker,
  type TimePickerProps as MuiTimePickerProps,
  DesktopTimePicker as MuiDesktopTimePicker,
  type DesktopTimePickerProps as MuiDesktopTimePickerProps,
  MobileTimePicker as MuiMobileTimePicker,
  type MobileTimePickerProps as MuiMobileTimePickerProps,
  StaticTimePicker as MuiStaticTimePicker,
  type StaticTimePickerProps as MuiStaticTimePickerProps
} from '@mui/x-date-pickers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TimePickerProps extends MuiTimePickerProps<any> {}

export const TimePicker = ({ ...props }: TimePickerProps) => {
  return <MuiTimePicker {...props} />;
};

export interface DesktopTimePickerProps extends MuiDesktopTimePickerProps<any> {}

export const DesktopTimePicker = ({ ...props }: DesktopTimePickerProps) => {
  return <MuiDesktopTimePicker {...props} />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MobileTimePickerProps extends MuiMobileTimePickerProps<any> {}

export const MobileTimePicker = ({ ...props }: MobileTimePickerProps) => {
  return <MuiMobileTimePicker {...props} />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface StaticTimePickerProps extends MuiStaticTimePickerProps<any> {}

export const StaticTimePicker = ({ ...props }: StaticTimePickerProps) => {
  return <MuiStaticTimePicker {...props} />;
};
