'use client';

import React, { useState, useMemo } from 'react';
import styles from './InvestigatedCases.module.css';
import { getFirRecords, getDistrictForStation, FIRRecord } from '@/data/dataService';
import { FileText, MapPin, Calendar, X } from 'lucide-react';

export default function InvestigatedCases() {
  const [selectedFir, setSelectedFir] = useState<FIRRecord | null>(null);

  const cases = useMemo(() => {
    const allFirs = getFirRecords();
    return allFirs
      .filter(f => f.CrimeType === 'Financial Fraud' || f.CrimeType === 'Cybercrime')
      .slice(0, 5); // Take top 5
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3><FileText size={16} /> Investigated FIRs</h3>
        <span className={styles.badge}>Live Feed</span>
      </div>
      <div className={styles.list}>
        {cases.map((c, i) => (
          <div key={i} className={styles.caseCard}>
            <div className={styles.caseHeader}>
              <span className={styles.caseId}>{c.CrimeNo || `FIR-${c.CaseMasterID}`}</span>
              <span className={styles.date}><Calendar size={12} /> {c.CrimeRegisteredDate}</span>
            </div>
            <div className={styles.caseType}>{c.CrimeType}</div>
            <div className={styles.brief}>{c.BriefFacts}</div>
            <div className={styles.footer}>
              <span className={styles.location}>
                <MapPin size={12} /> {getDistrictForStation(c.PoliceStationID)}
              </span>
              <button 
                className={styles.investigateBtn}
                onClick={() => setSelectedFir(c)}
              >
                Investigate
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedFir && (
        <div className={styles.modalOverlay} onClick={() => setSelectedFir(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Investigation Details</h2>
              <button className={styles.closeModalBtn} onClick={() => setSelectedFir(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalDetailRow}>
                <strong>FIR NO.</strong>
                {selectedFir.CrimeNo || `FIR-${selectedFir.CaseMasterID}`}
              </div>
              <div className={styles.modalDetailRow}>
                <strong>DISTRICT</strong>
                {getDistrictForStation(selectedFir.PoliceStationID)}
              </div>
              <div className={styles.modalDetailRow}>
                <strong>STATUS</strong>
                <span style={{ color: '#00d4aa' }}>Active Investigation</span>
              </div>
              <div className={styles.modalDetailRow}>
                <strong>BRIEF FACTS</strong>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {selectedFir.BriefFacts}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
