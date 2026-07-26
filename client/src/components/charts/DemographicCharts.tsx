'use client';

import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { getAccusedDemographics, getAllDistricts } from '@/data/dataService';
import styles from './DemographicCharts.module.css';

export default function DemographicCharts() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Karnataka');
  const districtList = useMemo(() => getAllDistricts(), []);

  const demographics = useMemo(() => {
    const filter = selectedDistrict === 'All Karnataka' ? 'All' : selectedDistrict;
    return getAccusedDemographics(filter);
  }, [selectedDistrict]);

  const totalStateAccused = useMemo(() => {
    return getAccusedDemographics('All').total;
  }, []);

  const ageCategories = ['18-25', '26-35', '36-45', '46-60', '60+'];
  const ageValues = ageCategories.map(
    (cat) => demographics.ageGroups[cat as keyof typeof demographics.ageGroups] || 0
  );

  const ageOptions = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        const count = p.value;
        const pct = demographics.total > 0 ? ((count / demographics.total) * 100).toFixed(1) : '0';
        return `${p.name}: <b>${count}</b> accused (${pct}%)`;
      },
    },
    grid: { left: '3%', right: '15%', top: '5%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      show: false,
    },
    yAxis: {
      type: 'category',
      data: ageCategories,
      inverse: true,
      axisLabel: { color: '#8b8b9e', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: 'Accused',
        type: 'bar',
        data: ageValues,
        barWidth: '55%',
        label: {
          show: true,
          position: 'right',
          color: '#e8e8ed',
          fontSize: 11,
          formatter: (params: any) => {
            const val = params.value;
            const pct = demographics.total > 0 ? ((val / demographics.total) * 100).toFixed(0) : '0';
            return `${val} (${pct}%)`;
          },
        },
        itemStyle: {
          color: '#00ffcc',
          borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  };

  const genderData = [
    { name: 'Male', value: demographics.gender.Male },
    { name: 'Female', value: demographics.gender.Female },
    { name: 'Other', value: demographics.gender.Other },
  ];

  const genderOptions = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <b>{c}</b> ({d}%)',
    },
    legend: {
      bottom: '0%',
      left: 'center',
      textStyle: { color: '#8b8b9e', fontSize: 11 },
      icon: 'circle',
      itemGap: 12,
    },
    series: [
      {
        name: 'Gender',
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#111118',
          borderWidth: 2,
        },
        label: { show: false },
        data: genderData,
        color: ['#00bfff', '#ff3355', '#7c3aed'],
      },
    ],
  };

  const pctOfState =
    totalStateAccused > 0
      ? ((demographics.total / totalStateAccused) * 100).toFixed(1)
      : '0';

  const youthCount = demographics.ageGroups['18-25'] || 0;
  const youthPct = demographics.total > 0 ? ((youthCount / demographics.total) * 100).toFixed(1) : '0';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="All Karnataka">All Karnataka</option>
          {districtList.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.panelsRow}>
        {/* Panel 1: Age Groups Horizontal Bar Chart */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Age Distribution</div>
          <div className={styles.chartWrapper}>
            <ReactECharts option={ageOptions} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Panel 2: Gender Donut Chart */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Gender Breakdown</div>
          <div className={styles.chartWrapper}>
            <ReactECharts option={genderOptions} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Panel 3: Total Accused Count Display */}
        <div className={styles.countCard}>
          <div className={styles.districtBadge}>{selectedDistrict}</div>
          <div className={styles.totalNumber}>{demographics.total.toLocaleString()}</div>
          <div className={styles.totalLabel}>Total Accused Registered</div>

          <div className={styles.subStats}>
            <div className={styles.subStatItem}>
              <span className={styles.subStatValue}>{demographics.gender.Male.toLocaleString()}</span>
              <span className={styles.subStatLabel}>Male</span>
            </div>
            <div className={styles.subStatItem}>
              <span className={styles.subStatValue}>{demographics.gender.Female.toLocaleString()}</span>
              <span className={styles.subStatLabel}>Female</span>
            </div>
            {selectedDistrict !== 'All Karnataka' && (
              <div className={styles.subStatItem}>
                <span className={styles.subStatValue}>{pctOfState}%</span>
                <span className={styles.subStatLabel}>of State Total</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* AI Insight Panel */}
      <div className={styles.aiInsightPanel}>
        <div className={styles.aiHeader}>
          <span className="badge badge-critical">AI INSIGHTS</span>
          <span>Demographic Risk Patterns</span>
        </div>
        
        {/* Dynamic Insights Logic */}
        <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', color: '#e8e8ed', fontSize: '0.95rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {parseFloat(youthPct) > 20 && (
            <li>
              <strong>{youthPct}% of suspects</strong> in {selectedDistrict} are between 18-25 years old. This indicates a concentrated youth-risk demographic requiring targeted early intervention.
            </li>
          )}
          
          {(demographics.ageGroups['26-35'] || 0) / demographics.total > 0.4 && (
            <li>
              <strong>Core Workforce Age:</strong> Over 40% of suspects fall in the 26-35 age bracket, suggesting economic or employment-related motivators behind regional crime rates.
            </li>
          )}

          {demographics.total > 0 && demographics.gender.Female / demographics.total > 0.1 && (
            <li>
              <strong>Gender Anomaly:</strong> Unusually elevated female participation (<strong>{((demographics.gender.Female / demographics.total) * 100).toFixed(1)}%</strong>) detected compared to standard baselines. Recommend investigating specific syndicates utilizing female operatives.
            </li>
          )}

          {selectedDistrict !== 'All Karnataka' && parseFloat(pctOfState) > 10 && (
            <li>
              <strong>State Contributor:</strong> This region alone accounts for <strong>{pctOfState}%</strong> of all statewide accused registrations, marking it as a critical priority zone for resource allocation.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
