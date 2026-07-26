'use client';

import React, { useEffect, useState } from 'react';
import { initCatalystData } from '@/data/dataService';

import { useAuth } from '@/components/auth/AuthProvider';

export default function ClientDataLoader({ children }: { children: React.ReactNode }) {
  const [dataLoaded, setDataLoaded] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return; // Wait until auth check completes

    async function loadData() {
      await initCatalystData(user);
      setDataLoaded(true);
    }
    loadData();
  }, [user, authLoading]);

  if (authLoading || !dataLoaded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="spinner" style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(255, 255, 255, 0.1)',
          borderTop: '5px solid #00E5FF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h3 style={{ marginTop: '20px', color: '#8b949e', fontWeight: 400 }}>Fetching Data from Catalyst...</h3>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
