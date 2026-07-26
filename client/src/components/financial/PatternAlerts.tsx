'use client';

import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, ArrowRight, X } from 'lucide-react';
import styles from './PatternAlerts.module.css';
import { getPatternAlerts, getFirRecords } from '../../data/dataService';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * PatternAlerts — real-time automated pattern detection cards.
 *
 * Features:
 * - Pulsing CSS dot severity indicators (critical = red, high = amber)
 * - Staggered fade-in animation (200ms offset per card)
 * - Left border colored by severity
 * - Monospace account numbers, pill state tags
 * - Right-aligned muted timestamps
 * - Teal "Investigate" CTA with glow hover
 */
export default function PatternAlerts() {
  const alerts = getPatternAlerts();
  const [activeAlert, setActiveAlert] = useState<any | null>(null);

  const getAlertCases = (alertId: string) => {
    // Generate some dynamic cases from firRecords based on the alert type
    const allFirs = getFirRecords();
    if (alertId === 'PAT-001') {
      return allFirs.filter(f => f.CrimeType === 'Cybercrime' && f.BriefFacts.toLowerCase().includes('digital arrest')).slice(0, 14);
    }
    if (alertId === 'PAT-002') {
      return allFirs.filter(f => f.BriefFacts.toLowerCase().includes('upi') || f.BriefFacts.toLowerCase().includes('otp')).slice(0, 23);
    }
    return allFirs.slice(0, 5);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>Automated Pattern Alerts</h3>

      <div className={styles.alertList}>
        {alerts.map((alert, index) => {
          const isCritical = alert.severity === 'critical';
          const severityClass = isCritical ? styles.cardCritical : styles.cardHigh;
          const cleanTitle = alert.title.replace(/^🚨\s*/, '');

          return (
            <div
              key={alert.id}
              className={`glass-card ${styles.alertCard} ${severityClass}`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className={styles.header}>
                <div className={styles.titleGroup}>
                  <span className={isCritical ? styles.pulseDotCritical : styles.pulseDotHigh} />
                  <h4 className={styles.alertTitle}>{cleanTitle}</h4>
                </div>
                <time className={styles.timestamp} dateTime={alert.timestamp}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>

              <p className={styles.description}>{alert.description}</p>
              
              <div className={styles.impactRow}>
                <span className={styles.impactValue}>{alert.linkedCases} Cases</span>
                <span className={styles.impactValue}>{formatCurrency(alert.financialImpact)}</span>
              </div>

              <div className={styles.actions}>
                <button 
                  className={styles.btnInvestigate} 
                  type="button" 
                  onClick={() => setActiveAlert(alert)}
                >
                  Investigate Details <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activeAlert && (
        <div className={styles.modalOverlay} onClick={() => setActiveAlert(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4>{activeAlert.title} - Case Reports</h4>
              <button className={styles.closeBtn} onClick={() => setActiveAlert(null)}><X size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <table className={styles.casesTable}>
                <thead>
                  <tr>
                    <th>FIR No</th>
                    <th>Date</th>
                    <th>Station</th>
                    <th>Brief Facts</th>
                  </tr>
                </thead>
                <tbody>
                  {getAlertCases(activeAlert.id).map((c: any) => (
                    <tr key={c.CaseMasterID}>
                      <td>{c.FIRNo || c.CrimeNo}</td>
                      <td>{c.FIR_Reg_DateTime || c.CrimeRegisteredDate}</td>
                      <td>{c.PoliceStationID}</td>
                      <td className={styles.factsCol}>{c.BriefFacts.length > 80 ? c.BriefFacts.substring(0, 80) + '...' : c.BriefFacts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
