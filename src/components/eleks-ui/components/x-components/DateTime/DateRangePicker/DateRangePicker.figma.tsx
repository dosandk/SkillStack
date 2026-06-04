import figma from '@figma/code-connect';
import dayjs from 'dayjs';

import { LocalizationProvider, AdapterDayjs } from '../api/index';
import { StaticDateRangePicker } from './index';

figma.connect(StaticDateRangePicker, '<FIGMA_DATE_RANGE_PICKER>', {
  props: {
    actionBarActions: figma.boolean('Footer?', {
      true: ['cancel', 'accept'],
      false: []
    }),
    toolBarHidden: figma.boolean('Header?', {
      true: false,
      false: true
    }),
    calendars: figma.enum('Breakpoints', {
      Mobile: 1,
      Desktop: 2
    })
  },
  imports: [
    "import dayjs from 'dayjs';",
    "import { LocalizationProvider, StaticDateRangePicker, AdapterDayjs } from '@eleks-ui/components';"
  ],
  example: ({ actionBarActions, toolBarHidden, calendars, ...props }) => {
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
    const defaultValue = [dayjs(new Date()), dayjs(new Date()).add(1, 'month')];

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StaticDateRangePicker
          {...props}
          calendars={calendars}
          defaultValue={defaultValue}
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
