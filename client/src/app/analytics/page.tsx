'use client';

import React from 'react';
import styles from './page.module.css';
import PageBanner from '@/components/layout/PageBanner';
import DistrictIntelTable from '@/components/charts/DistrictIntelTable';
import CrimeTypologyBar from '@/components/charts/CrimeTypologyBar';
import CrimeTrendChart from '@/components/charts/CrimeTrendChart';
import AnomalyCards from '@/components/charts/AnomalyCards';
import PredictiveRiskChart from '@/components/charts/PredictiveRiskChart';
import DemographicCharts from '@/components/charts/DemographicCharts';

export default function AnalyticsPage() {
  return (
    <div className={styles.container}>
      <PageBanner
        titleAccent="Crime Analytics"
        title="& Predictions"
        subtitle="Real-time intelligence and predictive insights for Karnataka"
        imageSrc="/images/analytics_banner.jpg"
      />

      {/* Each section is FULL WIDTH, stacked vertically with breathing room */}
      <div className={styles.stack}>

        {/* 1. District Intelligence Table */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>District Intelligence Ranking</h2>
          <p className={styles.panelSubtitle}>Click a district row to expand and view police station breakdown</p>
          <DistrictIntelTable />
        </section>

        {/* 2. Crime Trends — Full Width */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Crime Trends</h2>
          <div className={styles.chartTall}>
            <CrimeTrendChart />
          </div>
        </section>

        {/* 3. Crime Typology — Full Width */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Crime Typology</h2>
          <CrimeTypologyBar />
        </section>

        {/* 4. Predictive Risk Scores — Full Width */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Predictive Risk Scores</h2>
          <p className={styles.panelSubtitle}>All districts ranked by risk — click any row to expand police station breakdown</p>
          <PredictiveRiskChart />
        </section>

        {/* 5. Anomaly Detection — Full Width */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Anomaly Detection — Intelligence Alerts</h2>
          <p className={styles.panelSubtitle}>Stations with unusual spike in FIR volume compared to their daily average</p>
          <AnomalyCards />
        </section>

        {/* 6. Demographic Insights — Full Width */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Demographic Insights (Accused)</h2>
          <DemographicCharts />
        </section>
      </div>
    </div>
  );
}
