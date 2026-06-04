import {
  DateTimePicker as MuiDateTimePicker,
  type DateTimePickerProps as MuiDateTimePickerProps,
  DesktopDateTimePicker as MuiDesktopDateTimePicker,
  type DesktopDateTimePickerProps as MuiDesktopDateTimePickerProps,
  MobileDateTimePicker as MuiMobileDateTimePicker,
  type MobileDateTimePickerProps as MuiMobileDateTimePickerProps,
  StaticDateTimePicker as MuiStaticDateTimePicker,
  type StaticDateTimePickerProps as MuiStaticDateTimePickerProps
} from '@mui/x-date-pickers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DateTimePickerProps extends MuiDateTimePickerProps<any> {}

export const DateTimePicker = ({ ...props }: DateTimePickerProps) => {
  return <MuiDateTimePicker {...props} />;
};

export interface DesktopDateTimePickerProps extends MuiDesktopDateTimePickerProps<any> {}

export const DesktopDateTimePicker = ({
  ...props
}: DesktopDateTimePickerProps) => {
  return <MuiDesktopDateTimePicker {...props} />;
};

export interface MobileDateTimePickerProps extends MuiMobileDateTimePickerProps<any> {}

export const MobileDateTimePicker = ({
  ...props
}: MobileDateTimePickerProps) => {
  return <MuiMobileDateTimePicker {...props} />;
};

export interface StaticDateTimePickerProps extends MuiStaticDateTimePickerProps<any> {}

export const StaticDateTimePicker = ({
  ...props
}: StaticDateTimePickerProps) => {
  return <MuiStaticDateTimePicker {...props} />;
};
