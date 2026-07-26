'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { anomalyData } from '@/data/analyticsData';

export default function AnomalyChart() {
  // Map anomaly points to scatter data
  const anomalyScatter = anomalyData.anomalyPoints.map(p => {
    return [p.date, p.value, p.description];
  });

  const options = {
    backgroundColor: 'transparent',
    color: ['#00d4aa', '#ff3355'],
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1a1a25',
      borderColor: 'rgba(0, 212, 170, 0.3)',
      textStyle: { color: '#e8e8ed' },
      formatter: function (params: any) {
        let result = `<div>${params[0].axisValue}</div>`;
        let hasAnomaly = false;
        let anomalyDesc = '';
        
        params.forEach((param: any) => {
          if (param.seriesName === 'Actual') {
            result += `<div>${param.marker} Actual: ${param.value}</div>`;
          } else if (param.seriesName === 'Anomalies') {
             hasAnomaly = true;
             anomalyDesc = param.value[2];
          }
        });
        
        if (hasAnomaly) {
           result += `<div style="color: #ff3355; margin-top: 5px; font-weight: bold;">ANOMALY DETECTED</div>`;
           if (anomalyDesc) {
             result += `<div style="color: #ff3355; font-size: 11px;">${anomalyDesc}</div>`;
           }
        }
        return result;
      }
    },
    legend: {
      data: ['Actual', 'Anomalies'],
      textStyle: { color: '#e8e8ed' },
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: anomalyData.dates,
      axisLine: { lineStyle: { color: '#555566' } },
      axisLabel: { color: '#8b8b9e' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#1a1a25' } },
      axisLabel: { color: '#8b8b9e' },
      min: 'dataMin'
    },
    series: [
      {
        name: 'Baseline',
        type: 'line',
        data: anomalyData.baselines,
        lineStyle: { opacity: 0 },
        showSymbol: false,
        tooltip: { show: false }
      },
      {
        name: 'Upper Bound',
        type: 'line',
        data: anomalyData.upperBounds,
        lineStyle: { opacity: 0 },
        showSymbol: false,
        areaStyle: {
          color: 'rgba(0, 212, 170, 0.1)',
        },
        tooltip: { show: false }
      },
      {
        name: 'Actual',
        type: 'line',
        data: anomalyData.actuals,
        smooth: true,
        lineStyle: { color: '#00d4aa', width: 2 },
        showSymbol: false
      },
      {
        name: 'Anomalies',
        type: 'scatter',
        symbol: 'path://M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm0 832c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zm64-256c0 35.3-28.7 64-64 64s-64-28.7-64-64V256c0-35.3 28.7-64 64-64s64 28.7 64 64v320z',
        symbolSize: 15,
        itemStyle: { color: '#ff3355' },
        data: anomalyScatter,
        zlevel: 1
      }
    ],
    animationDuration: 2000
  };

  return <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />;
}
