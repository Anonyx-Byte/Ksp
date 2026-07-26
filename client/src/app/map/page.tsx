'use client';

import dynamic from 'next/dynamic';

/**
 * MapPage — Full-screen tactical choropleth map.
 * 
 * TacticalMap uses Leaflet (browser-only), so we dynamically import it
 * with SSR disabled to avoid window/document reference errors.
 */
const TacticalMap = dynamic(() => import('@/components/map/TacticalMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0f',
      color: '#00d4aa',
      fontFamily: "'JetBrains Mono', monospace",
      gap: '16px',
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '2px solid rgba(0, 212, 170, 0.15)',
        borderTopColor: '#00d4aa',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
        Initializing Tactical Interface…
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      <TacticalMap />
    </div>
  );
}
