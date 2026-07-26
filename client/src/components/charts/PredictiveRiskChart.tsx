'use client';

import React, { useState, useMemo } from 'react';
import styles from './PredictiveRiskChart.module.css';
import {
  getDistrictCrimeCounts,
  districts,
  firRecords,
  getStationName,
  getAllCrimeTypes,
} from '@/data/dataService';
import { ChevronRight, TrendingUp, TrendingDown, Minus, MapPin, Shield } from 'lucide-react';

export default function PredictiveRiskChart() {
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);

  const rawData = useMemo(() => getDistrictCrimeCounts(), []);
  const maxCases = useMemo(() => Math.max(...rawData.map((d) => d.total), 1), [rawData]);

  const districtData = useMemo(() => {
    return rawData.map((d) => ({
      ...d,
      riskScore: Math.round((d.total / maxCases) * 100),
    }));
  }, [rawData, maxCases]);

  // Station breakdown for expanded district
  const stationBreakdown = useMemo(() => {
    if (!expandedDistrict) return [];

    const districtInfo = districts.find((d) => d.DistrictName === expandedDistrict);
    if (!districtInfo) return [];

    const stationCounts = new Map<number, { name: string; total: number; cyber: number; active: number; topCrime: string }>();
    districtInfo.police_stations.forEach((ps) => {
      stationCounts.set(ps.UnitID, { name: ps.UnitName, total: 0, cyber: 0, active: 0, topCrime: '' });
    });

    const crimeMap = new Map<number, Map<string, number>>();
    firRecords.forEach((f) => {
      if (stationCounts.has(f.PoliceStationID)) {
        const s = stationCounts.get(f.PoliceStationID)!;
        s.total++;
        if (f.CrimeType === 'Cybercrime') s.cyber++;
        if (f.CaseStatusID === 1 || f.CaseStatusID === 4) s.active++;
        if (!crimeMap.has(f.PoliceStationID)) crimeMap.set(f.PoliceStationID, new Map());
        const cm = crimeMap.get(f.PoliceStationID)!;
        cm.set(f.CrimeType, (cm.get(f.CrimeType) || 0) + 1);
      }
    });

    stationCounts.forEach((s, id) => {
      const cm = crimeMap.get(id);
      if (cm) {
        let top = '', topC = 0;
        cm.forEach((c, t) => { if (c > topC) { topC = c; top = t; } });
        s.topCrime = top;
      }
    });

    return Array.from(stationCounts.values()).sort((a, b) => b.total - a.total);
  }, [expandedDistrict]);

  const expandedInfo = useMemo(
    () => districtData.find((d) => d.district === expandedDistrict),
    [expandedDistrict, districtData]
  );

  function riskColor(score: number) {
    if (score > 80) return '#ff3355';
    if (score > 40) return '#d4a574';
    return '#00ffcc';
  }

  function RiskArrow({ score }: { score: number }) {
    if (score > 60) return <TrendingUp size={14} style={{ color: '#ff3355' }} />;
    if (score > 30) return <Minus size={14} style={{ color: '#d4a574' }} />;
    return <TrendingDown size={14} style={{ color: '#00ffcc' }} />;
  }

  return (
    <div className={styles.container}>
      {/* ALL Districts — Full Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thExpand}></th>
              <th className={styles.th}>District</th>
              <th className={styles.th}>Risk</th>
              <th className={styles.thBar}>Risk Level</th>
              <th className={styles.th}>Cases</th>
              <th className={styles.th}>Cyber</th>
              <th className={styles.th}>Active</th>
              <th className={styles.th}>Heinous</th>
              <th className={styles.th}>Trend</th>
              <th className={styles.th}>Top Crime</th>
            </tr>
          </thead>
          <tbody>
            {districtData.map((d) => {
              const isExpanded = expandedDistrict === d.district;
              const color = riskColor(d.riskScore);
              return (
                <React.Fragment key={d.district}>
                  <tr
                    className={`${styles.row} ${isExpanded ? styles.rowExpanded : ''}`}
                    onClick={() => setExpandedDistrict(isExpanded ? null : d.district)}
                  >
                    <td className={styles.tdExpand}>
                      <ChevronRight size={14} className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`} />
                    </td>
                    <td className={styles.tdName}>{d.district}</td>
                    <td className={styles.tdScore} style={{ color }}>{d.riskScore}%</td>
                    <td className={styles.tdBar}>
                      <div className={styles.barTrack}>
                        <div className={styles.barFill} style={{ width: `${d.riskScore}%`, background: color }} />
                      </div>
                    </td>
                    <td className={styles.tdNum}>{d.total.toLocaleString()}</td>
                    <td className={styles.tdNum} style={{ color: '#7c3aed' }}>{d.cyber}</td>
                    <td className={styles.tdNum} style={{ color: '#00bfff' }}>{d.active}</td>
                    <td className={styles.tdNum} style={{ color: '#ff3355' }}>{d.heinous}</td>
                    <td className={styles.tdTrend}><RiskArrow score={d.riskScore} /></td>
                    <td className={styles.tdCrime}>{d.topCrime}</td>
                  </tr>

                  {/* Expanded: Station Breakdown INLINE */}
                  {isExpanded && (
                    <tr className={styles.expandedRow}>
                      <td colSpan={10}>
                        <div className={styles.stationPanel}>
                          <div className={styles.stationHeader}>
                            <MapPin size={14} style={{ color: '#00ffcc' }} />
                            <span className={styles.stationTitle}>{d.district} — Police Station Breakdown</span>
                            <span className={styles.stationMeta}>{stationBreakdown.length} stations | {d.total} total cases</span>
                          </div>
                          
                          <div style={{ padding: '12px', background: 'rgba(0, 255, 204, 0.05)', borderRadius: '6px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', borderLeft: '3px solid #00ffcc' }}>
                            <strong style={{ color: '#00ffcc' }}>AI Insight:</strong> {d.district} is showing a {d.riskScore > 60 ? 'high' : d.riskScore > 30 ? 'moderate' : 'stable'} risk trajectory.
                            The primary concern is <strong>{d.topCrime}</strong> which accounts for a significant portion of the {d.total} cases. 
                            {stationBreakdown.length > 0 && ` ${stationBreakdown[0].name} requires immediate resource allocation due to disproportionate case volume.`}
                          </div>

                          <div className={styles.stationGrid}>
                            {stationBreakdown.map((s, i) => {
                              const maxSt = stationBreakdown[0]?.total || 1;
                              return (
                                <div key={i} className={styles.stationCard}>
                                  <div className={styles.stationCardTop}>
                                    <Shield size={12} style={{ color: '#00ffcc', opacity: 0.5 }} />
                                    <span className={styles.stationCardName}>{s.name}</span>
                                  </div>
                                  <div className={styles.stationStats}>
                                    <span className={styles.stationStatMain}>{s.total} cases</span>
                                    <span className={styles.stationStatSub}>Cyber: {s.cyber}</span>
                                    <span className={styles.stationStatSub}>Active: {s.active}</span>
                                  </div>
                                  <div className={styles.stationBarTrack}>
                                    <div className={styles.stationBarFill} style={{ width: `${(s.total / maxSt) * 100}%` }} />
                                  </div>
                                  {s.topCrime && <span className={styles.stationCrime}>{s.topCrime}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
