'use client';
import React, { useEffect, useState } from 'react';
import styles from './GoldenHourPanel.module.css';
import { getFinancialStats, getFraudTypeBreakdown } from '../../data/dataService';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function GoldenHourPanel() {
  const [mounted, setMounted] = useState(false);
  
  const stats = getFinancialStats();
  const fraudTypeBreakdown = getFraudTypeBreakdown();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`glass-card ${styles.panel}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.pulsingDot}></span>
          Golden Hour Monitoring
        </h2>
        <div className={styles.timeFilter}>Real-time (Last 2 hours)</div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active Reports</div>
          <div className={styles.statValue}>
            {stats.activeReports}
            {stats.activeReports > 0 && <span className={styles.pulseActive}></span>}
          </div>
          <div className={styles.statSub}>Needs immediate action</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Amount at Risk</div>
          <div className={`${styles.statValue} ${styles.danger}`}>
            {/* Compute total from fraudTypeBreakdown since stats doesn't have totalAtRisk */}
            {formatCurrency(fraudTypeBreakdown.reduce((sum, item) => sum + item.amount, 0))}
          </div>
          <div className={styles.statSub}>Across {stats.activeReports} reports today</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Funds Frozen</div>
          <div className={`${styles.statValue} ${styles.success}`}>
            {stats.fundsFrozen}
          </div>
          <div className={styles.statSub}>
            <span className={styles.badge}>{stats.freezeRate}% freeze rate</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Avg Response Time</div>
          <div className={styles.statValue}>{stats.avgResponseTime}</div>
          <div className={styles.statSub}>From report to bank alert</div>
        </div>
      </div>

      <div className={styles.breakdownSection}>
        <h3 className={styles.breakdownTitle}>Fraud Type Breakdown</h3>
        <div className={styles.barsContainer}>
          {fraudTypeBreakdown.map((item, index) => {
            let colorClass = styles.barDefault;
            if (item.type === 'Investment Scam') colorClass = styles.barPurple;
            else if (item.type === 'Digital Arrest') colorClass = styles.barCrimson;
            else if (item.type === 'UPI Fraud') colorClass = styles.barAmber;
            else if (item.type === 'Loan App') colorClass = styles.barTeal;

            return (
              <div key={index} className={styles.barWrapper}>
                <div className={styles.barInfo}>
                  <span className={styles.barName}>{item.type}</span>
                  <span className={styles.barStats}>{formatCurrency(item.amount)} ({item.percentage}%)</span>
                </div>
                <div className={styles.barTrack}>
                  <div 
                    className={`${styles.barFill} ${colorClass}`} 
                    style={{ width: mounted ? `${item.percentage}%` : '0%' }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
