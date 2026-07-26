'use client';

import React, { useState, useMemo } from 'react';
import styles from './DistrictIntelTable.module.css';
import { getDistrictCrimeCounts, districts, firRecords, getStationName } from '@/data/dataService';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

type SortKey = 'district' | 'total' | 'cyber' | 'active' | 'heinous';

export default function DistrictIntelTable() {
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);

  const data = useMemo(() => getDistrictCrimeCounts(), []);

  const sorted = useMemo(() => {
    const d = [...data];
    d.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return d;
  }, [data, sortKey, sortAsc]);

  const maxTotal = Math.max(...data.map((d) => d.total));

  // Get station-level breakdown for expanded district
  const stationBreakdown = useMemo(() => {
    if (!expandedDistrict) return [];

    const districtInfo = districts.find((d) => d.DistrictName === expandedDistrict);
    if (!districtInfo) return [];

    // Count FIRs per station in this district
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

    // Compute top crime per station
    stationCounts.forEach((s, id) => {
      const cm = crimeMap.get(id);
      if (cm) {
        let top = '';
        let topC = 0;
        cm.forEach((c, t) => { if (c > topC) { topC = c; top = t; } });
        s.topCrime = top;
      }
    });

    return Array.from(stationCounts.values()).sort((a, b) => b.total - a.total);
  }, [expandedDistrict]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  function toggleExpand(district: string) {
    setExpandedDistrict(expandedDistrict === district ? null : district);
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return null;
    return sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  function riskLevel(total: number): { label: string; color: string } {
    if (total > 300) return { label: 'CRITICAL', color: '#ff3355' };
    if (total > 150) return { label: 'HIGH', color: '#d4a574' };
    if (total > 80) return { label: 'MEDIUM', color: '#00ffcc' };
    return { label: 'LOW', color: '#1a6b4a' };
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thRank}>#</th>
              <th className={styles.thExpand}></th>
              <th className={styles.th} onClick={() => toggleSort('district')}>
                District <SortIcon k="district" />
              </th>
              <th className={styles.th} onClick={() => toggleSort('total')}>
                Cases <SortIcon k="total" />
              </th>
              <th className={styles.thBar}>Intensity</th>
              <th className={styles.th} onClick={() => toggleSort('cyber')}>
                Cyber <SortIcon k="cyber" />
              </th>
              <th className={styles.th} onClick={() => toggleSort('active')}>
                Active <SortIcon k="active" />
              </th>
              <th className={styles.th}>Risk</th>
              <th className={styles.th}>Top Crime</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, i) => {
              const risk = riskLevel(d.total);
              const isExpanded = expandedDistrict === d.district;
              return (
                <React.Fragment key={d.district}>
                  <tr
                    className={`${styles.row} ${isExpanded ? styles.rowExpanded : ''}`}
                    onClick={() => toggleExpand(d.district)}
                  >
                    <td className={styles.tdRank}>{i + 1}</td>
                    <td className={styles.tdExpand}>
                      <ChevronRight
                        size={14}
                        className={`${styles.expandIcon} ${isExpanded ? styles.expandIconOpen : ''}`}
                      />
                    </td>
                    <td className={styles.tdDistrict}>{d.district}</td>
                    <td className={styles.tdNum}>{d.total.toLocaleString()}</td>
                    <td className={styles.tdBar}>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.barFill}
                          style={{
                            width: `${(d.total / maxTotal) * 100}%`,
                            background: risk.color,
                          }}
                        />
                      </div>
                    </td>
                    <td className={styles.tdNum} style={{ color: '#7c3aed' }}>{d.cyber}</td>
                    <td className={styles.tdNum} style={{ color: '#00ffcc' }}>{d.active}</td>
                    <td>
                      <span className={styles.riskBadge} style={{ color: risk.color, borderColor: risk.color }}>
                        {risk.label}
                      </span>
                    </td>
                    <td className={styles.tdCrime}>{d.topCrime}</td>
                  </tr>

                  {/* Expanded Station Rows */}
                  {isExpanded && stationBreakdown.map((s, si) => (
                    <tr key={`${d.district}-${si}`} className={styles.stationRow}>
                      <td></td>
                      <td></td>
                      <td className={styles.stationName}>↳ {s.name}</td>
                      <td className={styles.tdNum}>{s.total}</td>
                      <td className={styles.tdBar}>
                        <div className={styles.barTrack}>
                          <div
                            className={styles.barFill}
                            style={{
                              width: `${(s.total / (stationBreakdown[0]?.total || 1)) * 100}%`,
                              background: 'rgba(0, 255, 204, 0.5)',
                            }}
                          />
                        </div>
                      </td>
                      <td className={styles.tdNum} style={{ color: '#7c3aed' }}>{s.cyber}</td>
                      <td className={styles.tdNum} style={{ color: '#00ffcc' }}>{s.active}</td>
                      <td></td>
                      <td className={styles.tdCrime}>{s.topCrime}</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
