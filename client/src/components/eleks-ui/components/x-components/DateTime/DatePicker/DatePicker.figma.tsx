import figma from '@figma/code-connect';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  LocalizationProvider,
  PickersDay,
  PickersDayProps,
  DayCalendarSkeleton,
  AdapterDayjs
} from '../api/index';
import { StaticDatePicker } from './index';
import { Badge } from '../../../core/Badge';

const sharedProps = {
  showDaysOutsideCurrentMonth: figma.enum('Views', {
    'Date Outside Current': true
  }),
  displayWeekNumber: figma.enum('Views', {
    'Date Week Number': true
  }),
  openTo: figma.enum('Views', {
    Year: 'year',
    Month: 'month'
  }),
  actionBarActions: figma.boolean('Footer?', {
    true: ['cancel', 'accept'],
    false: []
  }),
  toolBarHidden: figma.boolean('Header?', {
    true: false,
    false: true
  })
};

figma.connect(StaticDatePicker, '<FIGMA_DATE_PICKER>', {
  props: sharedProps,
  imports: [
    "import dayjs from 'dayjs';",
    "import { LocalizationProvider, StaticDatePicker, AdapterDayjs } from '@eleks-ui/components';"
  ],
  // imports: ["import {AdapterDayjs } from '@eleks-ui/components';"],
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
        <StaticDatePicker
          {...props}
          defaultValue={defaultValue}
          yearsOrder="asc"
          yearsPerRow={3}
          views={['year', 'month', 'day']}
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

figma.connect(StaticDatePicker, '<FIGMA_DATE_PICKER>', {
  variant: {
    Views: 'Date Dynamic Data'
  },
  props: sharedProps,
  imports: [
    "import { useCallback, useEffect, useRef, useState, useMemo } from 'react';",
    "import dayjs, { Dayjs } from 'dayjs';",
    "import { LocalizationProvider, StaticDatePicker, PickersDay, PickersDayProps, DayCalendarSkeleton, AdapterDayjs } from '@eleks-ui/components';",
    "import { Badge } from '@eleks-ui/components';"
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
    const requestAbortController = useRef<AbortController | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedDays, setHighlightedDays] = useState([1, 2, 15]);

    const defaultValue = useMemo(() => dayjs(new Date()), []);

    // Move this function outside of the component to avoid re-creating it on every render
    const ServerDay = function (
      args: PickersDayProps<Dayjs> & { highlightedDays?: number[] }
    ) {
      const { highlightedDays = [], day, outsideCurrentMonth, ...other } = args;

      const isSelected =
        !outsideCurrentMonth && highlightedDays.indexOf(day.date()) >= 0;

      return (
        <Badge
          key={args.day.toString()}
          overlap="circular"
          invisible={!isSelected}
          variant="dot"
          color="secondary"
        >
          <PickersDay
            {...other}
            outsideCurrentMonth={outsideCurrentMonth}
            day={day}
          />
        </Badge>
      );
    };

    // Move this function outside of the component to avoid re-creating it on every render
    function getRandomNumber(min: number, max: number) {
      return Math.round(Math.random() * (max - min) + min);
    }

    const fetchHighlightedDays = useCallback((date: Dayjs) => {
      // Create and set the controller
      const controller = new AbortController();
      requestAbortController.current = controller;

      setIsLoading(true);
      setHighlightedDays([]);

      // Mock timeout that simulates an API call
      const timeout = setTimeout(() => {
        if (controller.signal.aborted) return;

        // Generate random days to highlight
        const daysInMonth = date.daysInMonth();
        const daysToHighlight = [1, 2, 3].map(() =>
          getRandomNumber(1, daysInMonth)
        );

        setHighlightedDays(daysToHighlight);
        setIsLoading(false);
      }, 500);

      // Handle abort
      controller.signal.addEventListener('abort', () => {
        clearTimeout(timeout);
      });
    }, []);

    useEffect(() => {
      fetchHighlightedDays(defaultValue);
      // abort request on unmount
      return () => requestAbortController.current?.abort();
    }, [fetchHighlightedDays, defaultValue]);

    const handleMonthChange = useCallback(
      (date: Dayjs) => {
        if (requestAbortController.current) {
          // make sure that you are aborting useless requests
          // because it is possible to switch between months pretty quickly
          requestAbortController.current.abort();
        }

        setIsLoading(true);
        setHighlightedDays([]);
        fetchHighlightedDays(date);
      },
      [fetchHighlightedDays]
    );

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StaticDatePicker
          {...props}
          defaultValue={defaultValue}
          loading={isLoading}
          onMonthChange={handleMonthChange}
          renderLoading={() => <DayCalendarSkeleton />}
          slots={{
            day: ServerDay
          }}
          yearsOrder="asc"
          yearsPerRow={3}
          views={['year', 'month', 'day']}
          slotProps={{
            actionBar: {
              actions: actionBarActions
            },
            toolbar: {
              hidden: toolBarHidden
            },
            day: {
              highlightedDays
            } as { highlightedDays: number[] }
          }}
        />
      </LocalizationProvider>
    );
  }
});
