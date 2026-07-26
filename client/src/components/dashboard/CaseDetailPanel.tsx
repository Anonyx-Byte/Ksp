import React, { useState, useEffect } from 'react';
import styles from './CaseDetailPanel.module.css';
import { findSimilarCases, getStationName, getDistrictForStation, FIRRecord } from '@/data/dataService';

interface Props {
  fir: FIRRecord;
  onClose: () => void;
}

export default function CaseDetailPanel({ fir, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'similar'>('details');
  const [similarCases, setSimilarCases] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'similar') {
      const cases = findSimilarCases(fir.CaseMasterID);
      setSimilarCases(cases);
    }
  }, [activeTab, fir.CaseMasterID]);

  return (
    <div className={styles.panelOverlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2>FIR-{fir.CrimeNo.slice(-9)}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'details' ? styles.active : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'similar' ? styles.active : ''}`}
            onClick={() => setActiveTab('similar')}
          >
            Similar Cases
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'details' ? (
            <div className={styles.detailsView}>
              <div className={styles.field}>
                <span className={styles.label}>Crime Type</span>
                <span className={styles.value}>{fir.CrimeType}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Location</span>
                <span className={styles.value}>{getStationName(fir.PoliceStationID)}, {getDistrictForStation(fir.PoliceStationID)}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Date</span>
                <span className={styles.value}>{fir.CrimeRegisteredDate}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Brief Facts</span>
                <span className={styles.value}>{fir.BriefFacts}</span>
              </div>
            </div>
          ) : (
            <div className={styles.similarView}>
              {similarCases.length === 0 ? (
                <div className={styles.emptyState}>No similar cases found.</div>
              ) : (
                similarCases.map(c => (
                  <div key={c.CaseMasterID} className={styles.similarCard}>
                    <div className={styles.cardHeader}>
                      <span className={styles.caseNo}>FIR-{c.CrimeNo.slice(-9)}</span>
                      <span className={styles.score}>{c.similarityScore}% Match</span>
                    </div>
                    <div className={styles.cardBody}>
                      <p>{c.BriefFacts}</p>
                      <span className={styles.meta}>{getStationName(c.PoliceStationID)}, {getDistrictForStation(c.PoliceStationID)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
