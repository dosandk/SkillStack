import figma from '@figma/code-connect';
import dayjs from 'dayjs';
import { StaticTimePicker } from './index';
import {
  AdapterDayjs,
  LocalizationProvider,
  renderTimeViewClock,
  renderMultiSectionDigitalClockTimeView
} from '../api/index';

figma.connect(StaticTimePicker, '<FIGMA_TIME_PICKER>', {
  props: {
    actionBarActions: figma.boolean('Actions?', {
      true: ['cancel', 'accept'],
      false: []
    }),
    toolBarHidden: figma.boolean('Header?', {
      true: false,
      false: true
    }),
    viewRenderers: figma.enum('Breakpoint', {
      Desktop: {
        hours: renderMultiSectionDigitalClockTimeView,
        minutes: renderMultiSectionDigitalClockTimeView,
        seconds: renderMultiSectionDigitalClockTimeView
      },
      Mobile: {
        hours: renderTimeViewClock,
        minutes: renderTimeViewClock,
        seconds: renderTimeViewClock
      }
    })
  },
  imports: [
    "import dayjs from 'dayjs';",
    "import { LocalizationProvider, StaticTimePicker, renderTimeViewClock, renderMultiSectionDigitalClockTimeView, AdapterDayjs } from '@eleks-ui/components';"
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
        <StaticTimePicker
          {...props}
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
