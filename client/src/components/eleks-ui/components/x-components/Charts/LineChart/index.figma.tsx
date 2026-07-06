import { LineChart } from './index';
import figma from '@figma/code-connect';

figma.connect(LineChart, '<FIGMA_LINE_CHART>', {
  variant: { Type: 'Simple' },
  example: () => {
    // { Type: "Simple" }
    // Tiger population data by region
    const tigerData = [15, 20, 30, 50, 55, 60, 65];
    const xLabels = [
      'India',
      'Indonesia',
      'Malaysia',
      'Thailand',
      'Nepal',
      'China',
      'Bangladesh'
    ];

    return (
      <LineChart
        series={[{ data: tigerData, label: 'Tigers', id: 'tigerId' }]}
        xAxis={[{ data: xLabels, scaleType: 'band', label: 'Region' }]}
        leftAxis={{}}
        rightAxis={{}}
        bottomAxis={{}}
        width={600}
        height={400}
      />
    );
  }
});

figma.connect(LineChart, '<FIGMA_LINE_CHART>', {
  variant: { Type: 'Grouped Bars' },
  example: () => {
    // { Type: "Grouped Bars" }
    // Animal population data by region
    const tigerData = [15, 20, 30, 50, 55, 60, 65];
    const elephantData = [125, 78, 56, 103, 42, 31, 97];
    const xLabels = [
      'India',
      'Indonesia',
      'Malaysia',
      'Thailand',
      'Nepal',
      'China',
      'Bangladesh'
    ];

    return (
      <LineChart
        series={[
          { data: tigerData, label: 'Tigers', id: 'tigerId', stack: 'animals' },
          {
            data: elephantData,
            label: 'Elephants',
            id: 'elephantId',
            stack: 'animals'
          }
        ]}
        xAxis={[{ data: xLabels, scaleType: 'band', label: 'Region' }]}
        leftAxis={{}}
        rightAxis={{}}
        bottomAxis={{}}
        width={600}
        height={400}
      />
    );
  }
});

figma.connect(LineChart, '<FIGMA_LINE_CHART>', {
  variant: { Type: 'Stacked Bars' },
  example: () => {
    // { Type: "Stacked Bars" }
    // Animal population data by region
    const tigerData = [15, 20, 30, 50, 55, 60, 65];
    const elephantData = [125, 78, 56, 103, 42, 31, 97];
    const xLabels = [
      'India',
      'Indonesia',
      'Malaysia',
      'Thailand',
      'Nepal',
      'China',
      'Bangladesh'
    ];

    return (
      <LineChart
        series={[
          {
            data: tigerData,
            label: 'Tigers',
            id: 'tigerId',
            stack: 'animals',
            area: true
          },
          {
            data: elephantData,
            label: 'Elephants',
            id: 'elephantId',
            stack: 'animals',
            area: true
          }
        ]}
        xAxis={[{ data: xLabels, scaleType: 'band', label: 'Region' }]}
        leftAxis={{}}
        rightAxis={{}}
        bottomAxis={{}}
        width={600}
        height={400}
      />
    );
  }
});
