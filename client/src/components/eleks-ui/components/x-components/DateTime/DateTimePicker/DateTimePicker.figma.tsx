import figma from '@figma/code-connect';
import dayjs from 'dayjs';
import { DateTimePicker, StaticDateTimePicker } from './index';
import { AdapterDayjs, LocalizationProvider } from '../api/index';

figma.connect(StaticDateTimePicker, '<FIGMA_DATE_TIME_PICKER>', {
  variant: { Breakpoints: 'Mobile' },
  props: {
    actionBarActions: figma.boolean('Footer?', {
      true: ['cancel', 'accept'],
      false: []
    }),
    toolBarHidden: figma.boolean('Header?', {
      true: false,
      false: true
    })
  },
  imports: [
    "import dayjs from 'dayjs';",
    "import { AdapterDayjs, LocalizationProvider, StaticDateTimePicker } from '@eleks-ui/components';"
  ],
  example: ({ actionBarActions, toolBarHidden, ...props }) => {
    /**
     *
     * Warning:
     *
     * For practical purposes, each demo in the documentation has its own <LocalizationProvider> wrapper.
     * We do not recommend reproducing this pattern as-is.
     * For almost all use cases, you should wrap your entire app with a single <LocalizationProvider>
     * to avoid repeating boilerplate code in multiple places.
     *
     **/
    const defaultValue = dayjs(new Date());

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StaticDateTimePicker
          {...props}
          defaultValue={defaultValue}
          yearsOrder="asc"
          yearsPerRow={3}
          views={['year', 'month', 'day', 'hours', 'minutes']}
          slotProps={{
            actionBar: {
              actions: actionBarActions
            },
            toolbar: {
              hidden: toolBarHidden
            }
          }}
        />
      </LocalizationProvider>
    );
  }
});

figma.connect(DateTimePicker, '<FIGMA_DATE_TIME_PICKER>', {
  variant: { Breakpoints: 'Desktop' },
  props: {
    actionBarActions: figma.boolean('Footer?', {
      true: ['cancel', 'accept'],
      false: []
    })
  },
  imports: [
    "import dayjs from 'dayjs';",
    "import { DateTimePicker, AdapterDayjs, LocalizationProvider } from '@eleks-ui/components';"
  ],
  example: ({ actionBarActions, ...props }) => {
    /**
     *
     * Warning:
     *
     * For practical purposes, each demo in the documentation has its own <LocalizationProvider> wrapper.
     * We do not recommend reproducing this pattern as-is.
     * For almost all use cases, you should wrap your entire app with a single <LocalizationProvider>
     * to avoid repeating boilerplate code in multiple places.
     *
     *
     * !Important:
     *
     * MUI doesn't have a StaticDateTimePicker component for the desktop variant.
     * You can customize the layout to look like a default DateTimePicker see. 'https://mui.com/x/react-date-pickers/custom-layout/'.
     * But it's time consuming and not recommended.
     * So, as a workaround, we are using the DateTimePicker component here
     *
     **/
    const defaultValue = dayjs(new Date());

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          {...props}
          defaultValue={defaultValue}
          yearsOrder="asc"
          views={['year', 'month', 'day', 'hours', 'minutes']}
          slotProps={{
            actionBar: {
              actions: actionBarActions
            }
          }}
        />
      </LocalizationProvider>
    );
  }
});
