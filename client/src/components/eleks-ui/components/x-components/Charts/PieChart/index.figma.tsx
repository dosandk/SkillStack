import figma from '@figma/code-connect';

import { PieChart } from './index';
import { pieArcLabelClasses, useDrawingArea } from '../api/index';

figma.connect(PieChart, '<FIGMA_PIE_CHART>', {
  variant: { Type: 'Simple' },
  props: {
    hole: figma.enum('Hole', {
      '0%': 0,
      '25%': 25,
      '50%': 50,
      '75%': 75
    })
  },
  example: ({ hole }) => {
    // { Type: "Simple" }
    // Tiger population data by region
    const tigerData = [
      { label: 'India', value: 15 },
      { label: 'Indonesia', value: 20 },
      { label: 'Malaysia', value: 30 }
    ];

    return (
      <PieChart
        series={[
          {
            data: tigerData,
            innerRadius: hole,
            outerRadius: 100
          }
        ]}
        height={300}
        width={400}
      />
    );
  }
});

figma.connect(PieChart, '<FIGMA_PIE_CHART>', {
  variant: { Type: 'StraightAngle' },
  props: {
    hole: figma.enum('Hole', {
      '0%': 0,
      '25%': 25,
      '50%': 50,
      '75%': 75
    })
  },
  example: ({ hole }) => {
    // { Type: "StraightAngle" }
    // Tiger population data by region
    const tigerData = [
      { label: 'India', value: 15 },
      { label: 'Indonesia', value: 20 },
      { label: 'Malaysia', value: 30 }
    ];

    return (
      <PieChart
        series={[
          {
            data: tigerData,
            innerRadius: hole,
            outerRadius: 100,
            startAngle: -90,
            endAngle: 90
          }
        ]}
        height={300}
        width={400}
      />
    );
  }
});

figma.connect(PieChart, '<FIGMA_PIE_CHART>', {
  variant: { Type: 'TwoLevel' },
  props: {
    hole: figma.enum('Hole', {
      '0%': 0,
      '25%': 25,
      '50%': 50,
      '75%': 75
    })
  },
  example: () => {
    // { Type: "TwoLevel" }
    // Tiger population data by region
    const tigerData = [
      { id: 1, label: 'India', value: 15, color: '#B800D8' },
      { id: 2, label: 'Indonesia', value: 20, color: '#02B2AF' },
      { id: 3, label: 'Malaysia', value: 30, color: '#2E96FF' }
    ];
    // Elephant population data by region
    const elephantData = [
      { id: 1, label: 'India', value: 30, color: '#B800D8' },
      { id: 2, label: 'Indonesia', value: 45, color: '#02B2AF' },
      { id: 3, label: 'Malaysia', value: 50, color: '#2E96FF' }
    ];

    return (
      <PieChart
        series={[
          {
            data: tigerData,
            innerRadius: 0,
            outerRadius: 100
          },
          {
            data: elephantData,
            innerRadius: 120,
            outerRadius: 140
          }
        ]}
        slotProps={{ legend: { seriesToDisplay: tigerData } }}
        height={300}
        width={500}
      />
    );
  }
});

figma.connect(PieChart, '<FIGMA_PIE_CHART>', {
  variant: { Type: 'PaddingAngle' },
  props: {
    hole: figma.enum('Hole', {
      '0%': 0,
      '25%': 25,
      '50%': 50,
      '75%': 75
    })
  },
  example: ({ hole }) => {
    const tigerData = [
      { label: 'India', value: 15 },
      { label: 'Indonesia', value: 20 },
      { label: 'Malaysia', value: 30 }
    ];

    return (
      <PieChart
        series={[
          {
            data: tigerData,
            paddingAngle: 5,
            innerRadius: hole,
            outerRadius: 100
          }
        ]}
        height={300}
        width={400}
      />
    );
  }
});

figma.connect(PieChart, '<FIGMA_PIE_CHART>', {
  imports: ["import { PieChart, useDrawingArea } from '@eleks-ui/components'"],
  variant: { Type: 'CenterLabel' },
  props: {
    hole: figma.enum('Hole', {
      '0%': 0,
      '25%': 25,
      '50%': 50,
      '75%': 75
    })
  },
  example: () => {
    // { Type: "CenterLabel" }
    // Tiger population data by region
    const tigerData = [
      { label: 'India', value: 15 },
      { label: 'Indonesia', value: 20 },
      { label: 'Malaysia', value: 30 }
    ];

    function PieCenterLabel({ children }: { children: React.ReactNode }) {
      const { width, height, left, top } = useDrawingArea();
      return (
        <text
          x={left + width / 2}
          y={top + height / 2}
          style={{ textAnchor: 'middle' }}
        >
          {children}
        </text>
      );
    }

    return (
      <PieChart
        series={[
          {
            data: tigerData,
            innerRadius: 80,
            outerRadius: 100
          }
        ]}
        height={300}
        width={400}
      >
        <PieCenterLabel>Label</PieCenterLabel>
      </PieChart>
    );
  }
});

figma.connect(PieChart, '<FIGMA_PIE_CHART>', {
  variant: { Type: 'PaddingStraightAngle' },
  props: {
    hole: figma.enum('Hole', {
      '0%': 0,
      '25%': 25,
      '50%': 50,
      '75%': 75
    })
  },
  example: ({ hole }) => {
    // { Type: "CustomizedLabel" }
    // Tiger population data by region
    const tigerData = [
      { label: 'India', value: 15 },
      { label: 'Indonesia', value: 20 },
      { label: 'Malaysia', value: 30 }
    ];

    return (
      <PieChart
        series={[
          {
            data: tigerData,
            paddingAngle: 5,
            innerRadius: hole,
            outerRadius: 100,
            startAngle: -90,
            endAngle: 90
          }
        ]}
        height={300}
        width={400}
      />
    );
  }
});

figma.connect(PieChart, '<FIGMA_PIE_CHART>', {
  variant: { Type: 'CustomizedLabel' },
  props: {
    hole: figma.enum('Hole', {
      '0%': 0,
      '25%': 25,
      '50%': 50,
      '75%': 75
    })
  },
  example: ({ hole }) => {
    // { Type: "CustomizedLabel" }
    // Tiger population data by region
    const tigerData = [
      { label: 'India', value: 15 },
      { label: 'Indonesia', value: 20 },
      { label: 'Malaysia', value: 30 }
    ];

    // Calculate total and create a labelFormatter to display percentages
    const total = tigerData.reduce((sum, item) => sum + item.value, 0);
    const labelFormatter = (value: number) =>
      ((value / total) * 100).toFixed(2) + '%';

    return (
      <PieChart
        series={[
          {
            arcLabel: item => labelFormatter(item.value),
            data: tigerData,
            innerRadius: hole,
            outerRadius: 100
          }
        ]}
        height={300}
        width={400}
        sx={{
          ['& .' + pieArcLabelClasses.root]: {
            fill: '#FFFFFF'
          }
        }}
      />
    );
  }
});
