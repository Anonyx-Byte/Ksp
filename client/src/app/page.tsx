'use client';

import { useState, useMemo } from 'react';
import styles from './page.module.css';
import PageBanner from '@/components/layout/PageBanner';
import {
  getKPIStats,
  getRecentFIRs,
  getRepeatOffenders,
  getAllCrimeTypes,
  getAllDistricts,
  FIRRecord,
} from '@/data/dataService';
import { FileText, ShieldAlert, Monitor, AlertTriangle, Filter } from 'lucide-react';
import CaseDetailPanel from '@/components/dashboard/CaseDetailPanel';

export default function Dashboard() {
  const [crimeFilter, setCrimeFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [selectedFIR, setSelectedFIR] = useState<FIRRecord | null>(null);

  const kpi = useMemo(() => getKPIStats(), []);
  const crimeTypes = useMemo(() => getAllCrimeTypes(), []);
  const districtList = useMemo(() => getAllDistricts(), []);
  const repeatOffenders = useMemo(() => getRepeatOffenders().slice(0, 3), []);

  const recentFIRs = useMemo(
    () =>
      getRecentFIRs({
        crimeType: crimeFilter !== 'All' ? crimeFilter : undefined,
        district: districtFilter !== 'All' ? districtFilter : undefined,
        status: statusFilter,
        limit: 15,
      }),
    [crimeFilter, districtFilter, statusFilter]
  );

  const kpiCards = [
    { label: 'Total FIRs', value: kpi.total.toLocaleString(), icon: FileText, color: '#00ffcc', change: `${kpi.total}`, changeType: 'neutral' as const },
    { label: 'Active Cases', value: kpi.active.toLocaleString(), icon: ShieldAlert, color: '#d4a574', change: `${((kpi.active / kpi.total) * 100).toFixed(1)}%`, changeType: 'up' as const },
    { label: 'Cybercrime Cases', value: kpi.cyber.toLocaleString(), icon: Monitor, color: '#7c3aed', change: `${((kpi.cyber / kpi.total) * 100).toFixed(1)}%`, changeType: 'up' as const },
    { label: 'Heinous Offences', value: kpi.heinous.toLocaleString(), icon: AlertTriangle, color: '#ff3355', change: `${((kpi.heinous / kpi.total) * 100).toFixed(1)}%`, changeType: 'up' as const },
  ];

  function timeAgo(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1d ago';
    if (diffDays < 30) return `${diffDays}d ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  }

  return (
    <div className={styles.dashboard}>
      <PageBanner
        titleAccent="Command Center"
        title="— IRIS Dashboard"
        subtitle="Karnataka State Police Intelligence Hub"
        imageSrc="/images/dashboard_banner.jpg"
      />

      {/* KPI Stats Grid */}
      <div className={styles.kpiGrid}>
        {kpiCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={styles.kpiCard} style={{ borderLeftColor: stat.color }}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>{stat.label}</span>
                <Icon size={18} style={{ color: stat.color, opacity: 0.7 }} />
              </div>
              <div className={styles.kpiBody}>
                <div className={styles.kpiValue}>{stat.value}</div>
                <div className={styles.kpiChangeContainer}>
                  <span className={styles.kpiChange} style={{ color: stat.color }}>{stat.change}</span>
                  {stat.label === 'Cybercrime Cases' && (
                    <span className="badge badge-critical" style={{ marginLeft: '8px' }}>CRITICAL</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.mainContent}>
        {/* Recent FIRs with Filters */}
        <div className={styles.firSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent FIRs</h2>
            <span className="badge badge-active">LIVE</span>
          </div>

          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <Filter size={14} className={styles.filterIcon} />
            <select
              value={crimeFilter}
              onChange={(e) => setCrimeFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="All">All Crimes</option>
              {crimeTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
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
            <select
              value={statusFilter ?? ''}
              onChange={(e) => setStatusFilter(e.target.value ? Number(e.target.value) : undefined)}
              className={styles.filterSelect}
            >
              <option value="">All Status</option>
              <option value="1">Under Investigation</option>
              <option value="2">Charge Sheeted</option>
              <option value="3">Closed</option>
              <option value="4">Active</option>
            </select>
          </div>

          <div className={styles.firList}>
            {recentFIRs.length === 0 && (
              <div className={styles.emptyState}>No FIRs match filters</div>
            )}
            {recentFIRs.map((fir) => (
              <div 
                key={fir.CaseMasterID} 
                className={styles.firItem}
                onClick={() => setSelectedFIR(fir)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.firItemHeader}>
                  <span className={styles.firNumber}>FIR-{fir.CrimeNo.slice(-9)}</span>
                  <span className={styles.firTime}>{timeAgo(fir.CrimeRegisteredDate)}</span>
                </div>
                <div className={styles.firDetails}>
                  <span className={styles.firCrimeType}>{fir.CrimeType}</span>
                  <span className={styles.firLocation}>{fir.stationName}, {fir.districtName}</span>
                </div>
                <div className={styles.firFooter}>
                  <span className={`badge ${fir.GravityOffenceID === 1 ? 'badge-critical' : 'badge-warning'}`}>
                    {fir.gravityName}
                  </span>
                  <span className={styles.firStatus}>{fir.statusName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Alerts — Repeat Offenders */}
        <div className={styles.alertsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Intelligence Alerts</h2>
          </div>

          {/* Repeat Offender Alerts */}
          {repeatOffenders.map((offender, i) => (
            <div key={i} className={styles.alertCard}>
              <div className={styles.alertHeader}>
                <span className="badge badge-critical">REPEAT OFFENDER</span>
                <span className={styles.alertMeta}>{offender.caseIds.length} FIRs</span>
              </div>
              <h3 className={styles.alertTitle}>{offender.name}</h3>
              <p className={styles.alertDescription}>
                Linked to {offender.caseIds.length} cases across {offender.districts.join(', ')}.
                Crime types: {offender.crimeTypes.join(', ')}.
              </p>
              <div className={styles.alertFooter}>
                <span className={styles.alertDistrict}>📍 {offender.districts[0]}</span>
                <button 
                  className="btn btn-secondary"
                  onClick={() => window.location.href = '/network'}
                >
                  View Network
                </button>
              </div>
            </div>
          ))}

          {/* Static alerts */}
          <div className={styles.alertCard}>
            <div className={styles.alertHeader}>
              <span className="badge badge-warning">NETWORK ANOMALY</span>
              <span className={styles.alertMeta}>Pattern</span>
            </div>
            <h3 className={styles.alertTitle}>Surge in Cybercrime — Bengaluru</h3>
            <p className={styles.alertDescription}>
              {kpiCards[2].value} cybercrime FIRs detected statewide ({kpiCards[2].change} of total).
              Highest concentration in Bengaluru Urban.
            </p>
            <div className={styles.alertFooter}>
              <span className={styles.alertDistrict}>📍 Statewide</span>
              <button 
                className="btn btn-secondary"
                onClick={() => window.alert('Investigate module not yet implemented.')}
              >
                Investigate
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {selectedFIR && (
        <CaseDetailPanel 
          fir={selectedFIR} 
          onClose={() => setSelectedFIR(null)} 
        />
      )}
    </div>
  );
}
