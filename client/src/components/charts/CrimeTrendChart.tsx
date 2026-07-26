'use client';

import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import styles from './CrimeTrendChart.module.css';
import { getMonthlyCrimeTrends } from '@/data/dataService';

const topTypes = ['Cybercrime', 'Theft/Property', 'Assault/Violent', 'Fraud/Cheating'];
const colors = ['#7c3aed', '#d4a574', '#ff3355', '#00ffcc'];

export default function CrimeTrendChart() {
  const allTrends = useMemo(() => getMonthlyCrimeTrends(), []);
  const allMonths = allTrends.map((t) => t.month);

  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(allMonths.length - 1);

  const trends = useMemo(
    () => allTrends.slice(rangeStart, rangeEnd + 1),
    [allTrends, rangeStart, rangeEnd]
  );

  const months = trends.map((t) => t.month);
  const series = topTypes.map((type, i) => ({
    name: type,
    type: 'line' as const,
    smooth: true,
    data: trends.map((t) => t.counts[type] || 0),
    lineStyle: { width: 2 },
    showSymbol: false,
    emphasis: { focus: 'series' as const },
    itemStyle: { color: colors[i] },
  }));

  const options = {
    backgroundColor: 'transparent',
    color: colors,
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1a1a25',
      borderColor: 'rgba(0, 255, 204, 0.3)',
      textStyle: { color: '#e8e8ed' },
      axisPointer: { type: 'cross', label: { backgroundColor: '#111118' } },
    },
    legend: {
      data: topTypes,
      textStyle: { color: '#e8e8ed' },
      top: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { lineStyle: { color: '#555566' } },
      axisLabel: { color: '#8b8b9e' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLabel: { color: '#8b8b9e' },
    },
    series,
    animationDuration: 1500,
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.timelineBar}>
        <span className={styles.timeLabel}>{allMonths[rangeStart]}</span>
        <input
          type="range"
          min={0}
          max={allMonths.length - 1}
          value={rangeStart}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v < rangeEnd) setRangeStart(v);
          }}
          className={styles.slider}
        />
        <input
          type="range"
          min={0}
          max={allMonths.length - 1}
          value={rangeEnd}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v > rangeStart) setRangeEnd(v);
          }}
          className={styles.slider}
        />
        <span className={styles.timeLabel}>{allMonths[rangeEnd]}</span>
        <button
          className={styles.resetBtn}
          onClick={() => { setRangeStart(0); setRangeEnd(allMonths.length - 1); }}
        >
          Reset
        </button>
      </div>
      <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
