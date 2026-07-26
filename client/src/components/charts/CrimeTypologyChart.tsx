'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { crimeTypologyData } from '@/data/analyticsData';

export default function CrimeTypologyChart() {
  const options = {
    backgroundColor: 'transparent',
    color: ['#7c3aed', '#d4a574', '#ff3355', '#00bfff', '#1a6b4a', '#8b8b9e'],
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1a1a25',
      borderColor: 'rgba(0, 212, 170, 0.3)',
      textStyle: { color: '#e8e8ed' }
    },
    series: [
      {
        type: 'sunburst',
        data: crimeTypologyData,
        radius: [0, '90%'],
        itemStyle: {
          borderRadius: 4,
          borderWidth: 1,
          borderColor: '#111118'
        },
        label: {
          show: true,
          color: '#e8e8ed',
          fontSize: 10,
          formatter: '{b}'
        },
        animationDurationUpdate: 1000
      }
    ],
    animationDuration: 2000
  };

  return <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />;
}
