'use client';

import { useState, useMemo } from 'react';
import styles from './CrimeTypologyBar.module.css';
import { firRecords, getDistrictForStation, getAllDistricts } from '@/data/dataService';

export default function CrimeTypologyBar() {
  const [districtFilter, setDistrictFilter] = useState('All');
  const districtList = useMemo(() => getAllDistricts(), []);

  const data = useMemo(() => {
    let firs = [...firRecords];
    if (districtFilter !== 'All') {
      firs = firs.filter((f) => getDistrictForStation(f.PoliceStationID) === districtFilter);
    }
    const map = new Map<string, number>();
    firs.forEach((f) => map.set(f.CrimeType, (map.get(f.CrimeType) || 0) + 1));
    return Array.from(map.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [districtFilter]);

  const maxCount = data.length > 0 ? data[0].count : 1;
  const totalCount = data.reduce((s, d) => s + d.count, 0);

  const barColors = [
    '#7c3aed', '#00ffcc', '#ff3355', '#d4a574', '#00bfff',
    '#e879f9', '#fbbf24', '#34d399', '#f97316',
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="All">All Karnataka ({totalCount})</option>
          {districtList.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className={styles.bars}>
        {data.map((d, i) => {
          const pct = ((d.count / totalCount) * 100).toFixed(1);
          return (
            <div key={d.type} className={styles.barRow}>
              <span className={styles.barLabel}>{d.type}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${(d.count / maxCount) * 100}%`,
                    background: barColors[i % barColors.length],
                  }}
                />
              </div>
              <span className={styles.barCount}>{d.count.toLocaleString()}</span>
              <span className={styles.barPct}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
