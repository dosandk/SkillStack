import { BarChart } from './index';
import figma from '@figma/code-connect';

figma.connect(BarChart, '<FIGMA_BAR_CHART>', {
  variant: { Type: 'Simple' },
  example: () => {
    // { Type: "Simple" }
    // Tiger population data by region
    const tigerData = [72, 45, 91, 33, 87, 19, 64];
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
      <BarChart
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

figma.connect(BarChart, '<FIGMA_BAR_CHART>', {
  variant: { Type: 'Grouped Bars' },
  example: () => {
    // { Type: "Grouped Bars" },
    // Animal population data by region
    const tigerData = [72, 45, 91, 33, 87, 19, 64];
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
      <BarChart
        series={[
          { data: tigerData, label: 'Tigers', id: 'tigerId' },
          { data: elephantData, label: 'Elephants', id: 'elephantId' }
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

figma.connect(BarChart, '<FIGMA_BAR_CHART>', {
  variant: { Type: 'Stacked Bars' },
  example: () => {
    // { Type: "Stacked Bars" }
    // Animal population data by region
    const tigerData = [72, 45, 91, 33, 87, 19, 64];
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
      <BarChart
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
