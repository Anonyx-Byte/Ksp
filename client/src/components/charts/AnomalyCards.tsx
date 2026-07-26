'use client';

import { useState, useMemo } from 'react';
import styles from './AnomalyCards.module.css';
import { firRecords, getDistrictForStation, getStationName, getAllDistricts } from '@/data/dataService';
import { AlertTriangle, TrendingUp, MapPin, Calendar, Filter } from 'lucide-react';

interface AnomalyEvent {
  date: string;
  district: string;
  station: string;
  expected: number;
  actual: number;
  dominantCrime: string;
  dominantPct: number;
  severity: 'critical' | 'high' | 'medium';
  briefing: string;
}

export default function AnomalyCards() {
  const [districtFilter, setDistrictFilter] = useState('All');
  const districtList = useMemo(() => getAllDistricts(), []);

  // Get date range from data
  const dates = useMemo(() => {
    const all = firRecords.map((f) => f.CrimeRegisteredDate).sort();
    return { min: all[0], max: all[all.length - 1] };
  }, []);

  const [startDate, setStartDate] = useState(dates.min);
  const [endDate, setEndDate] = useState(dates.max);

  const anomalies = useMemo(() => {
    // Filter FIRs by date range and district
    let filtered = firRecords.filter(
      (f) => f.CrimeRegisteredDate >= startDate && f.CrimeRegisteredDate <= endDate
    );
    if (districtFilter !== 'All') {
      filtered = filtered.filter((f) => getDistrictForStation(f.PoliceStationID) === districtFilter);
    }

    // Group by (date, station)
    const dailyMap = new Map<string, { district: string; station: string; date: string; crimes: Map<string, number>; total: number }>();

    filtered.forEach((f) => {
      const key = `${f.CrimeRegisteredDate}|${f.PoliceStationID}`;
      if (!dailyMap.has(key)) {
        dailyMap.set(key, {
          district: getDistrictForStation(f.PoliceStationID),
          station: getStationName(f.PoliceStationID),
          date: f.CrimeRegisteredDate,
          crimes: new Map(),
          total: 0,
        });
      }
      const entry = dailyMap.get(key)!;
      entry.total++;
      entry.crimes.set(f.CrimeType, (entry.crimes.get(f.CrimeType) || 0) + 1);
    });

    // Station daily averages
    const stationAvgs = new Map<string, number>();
    const stationDays = new Map<string, number>();
    const stationTotals = new Map<string, number>();

    dailyMap.forEach((v) => {
      stationTotals.set(v.station, (stationTotals.get(v.station) || 0) + v.total);
      stationDays.set(v.station, (stationDays.get(v.station) || 0) + 1);
    });

    stationTotals.forEach((total, station) => {
      stationAvgs.set(station, total / (stationDays.get(station) || 1));
    });

    // Detect anomalies: days where count > 2x average
    const events: AnomalyEvent[] = [];
    dailyMap.forEach((v) => {
      const avg = stationAvgs.get(v.station) || 1;
      if (v.total >= avg * 2 && v.total >= 3) {
        let topCrime = 'Unknown';
        let topCount = 0;
        v.crimes.forEach((c, t) => { if (c > topCount) { topCount = c; topCrime = t; } });

        const severity: AnomalyEvent['severity'] =
          v.total >= avg * 4 ? 'critical' :
          v.total >= avg * 3 ? 'high' : 'medium';

        const multiplier = (v.total / avg).toFixed(1);

        // Generate human-readable briefing
        const briefing = `${v.station} in ${v.district} recorded ${v.total} FIRs on ${v.date} — ${multiplier}x the station's daily average of ${Math.round(avg)}. Dominant crime: ${topCrime} (${Math.round((topCount / v.total) * 100)}% of cases). Immediate attention recommended for resource deployment.`;

        events.push({
          date: v.date,
          district: v.district,
          station: v.station,
          expected: Math.round(avg),
          actual: v.total,
          dominantCrime: topCrime,
          dominantPct: Math.round((topCount / v.total) * 100),
          severity,
          briefing,
        });
      }
    });

    const sevOrder = { critical: 0, high: 1, medium: 2 };
    events.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity] || b.date.localeCompare(a.date));

    return events.slice(0, 8);
  }, [districtFilter, startDate, endDate]);

  const sevColors = {
    critical: { bg: 'rgba(255, 51, 85, 0.08)', border: 'rgba(255, 51, 85, 0.25)', text: '#ff3355' },
    high: { bg: 'rgba(212, 165, 116, 0.08)', border: 'rgba(212, 165, 116, 0.25)', text: '#d4a574' },
    medium: { bg: 'rgba(0, 255, 204, 0.05)', border: 'rgba(0, 255, 204, 0.15)', text: '#00ffcc' },
  };

  return (
    <div className={styles.wrapper}>
      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <Filter size={14} className={styles.filterIcon} />
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="All">All Districts</option>
          {districtList.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <label className={styles.dateLabel}>From</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={styles.dateInput}
        />
        <label className={styles.dateLabel}>To</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={styles.dateInput}
        />
        <span className={styles.resultCount}>{anomalies.length} anomalies found</span>
      </div>

      {/* Cards */}
      {anomalies.length === 0 ? (
        <div className={styles.empty}>No anomalies detected for the selected filters</div>
      ) : (
        <div className={styles.container}>
          {anomalies.map((a, i) => {
            const c = sevColors[a.severity];
            return (
              <div key={i} className={styles.card} style={{ background: c.bg, borderColor: c.border }}>
                <div className={styles.cardHeader}>
                  <span className={styles.severity} style={{ color: c.text }}>
                    <AlertTriangle size={12} />
                    {a.severity.toUpperCase()}
                  </span>
                  <span className={styles.date}>
                    <Calendar size={11} /> {a.date}
                  </span>
                </div>

                <div className={styles.location}>
                  <MapPin size={12} />
                  <span>{a.station}</span>
                  <span className={styles.district}>• {a.district}</span>
                </div>

                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Expected</span>
                    <span className={styles.statValue}>~{a.expected}/day</span>
                  </div>
                  <div className={styles.statArrow}>
                    <TrendingUp size={16} style={{ color: c.text }} />
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Actual</span>
                    <span className={styles.statValue} style={{ color: c.text, fontWeight: 700 }}>{a.actual}</span>
                  </div>
                  <div className={styles.crimeTag}>
                    {a.dominantCrime} ({a.dominantPct}%)
                  </div>
                </div>

                {/* Situational Briefing */}
                <div className={styles.briefing}>
                  <span className={styles.briefLabel}>SITUATION BRIEF</span>
                  <p className={styles.briefText}>{a.briefing}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
