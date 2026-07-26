import React from 'react';
import GoldenHourPanel from '../../components/financial/GoldenHourPanel';
import MoneyTrailSankey from '../../components/financial/MoneyTrailSankey';
import MuleAccountTable from '../../components/financial/MuleAccountTable';
import PatternAlerts from '../../components/financial/PatternAlerts';
import InvestigatedCases from '../../components/financial/InvestigatedCases';
import PageBanner from '@/components/layout/PageBanner';
import styles from './page.module.css';

export const metadata = {
  title: 'Financial Crime | Project IRIS',
};

export default function FinancialCrimePage() {
  return (
    <div className={styles.pageContainer}>
      <PageBanner
        titleAccent="Financial Crime"
        title="— Money Trail Analysis"
        subtitle="Real-time tracking of fraudulent transactions and mule networks"
        imageSrc="/images/hampi_banner.jpg"
      />

      <div className={styles.topSection}>
        <GoldenHourPanel />
      </div>

      <div className={styles.middleSection}>
        <div className={styles.sankeyWrapper}>
          <div className={styles.sankeyContainer}>
            <MoneyTrailSankey />
          </div>
          <div className={styles.investigatedContainer}>
            <InvestigatedCases />
          </div>
        </div>
        <div className={styles.alertsContainer}>
          <PatternAlerts />
        </div>
      </div>

      <div className={styles.bottomSection}>
        <MuleAccountTable />
      </div>
    </div>
  );
}
