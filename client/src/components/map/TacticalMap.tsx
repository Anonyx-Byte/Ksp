'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import type L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './TacticalMap.module.css';
import { getMapDistrictData, getMapStationData } from '@/data/dataService';

const riskFillColors: Record<string, string> = {
  critical: '#ff3355',
  high: '#d4a574',
  medium: '#00d4aa',
  low: '#1a6b4a',
};

const riskFillOpacity: Record<string, number> = {
  critical: 0.45,
  high: 0.3,
  medium: 0.15,
  low: 0.08,
};

const filterTypes = ['All Crimes', 'Cybercrime', 'Theft', 'Violent', 'Financial'];

export default function TacticalMap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const stationLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeFilter, setActiveFilter] = useState('All Crimes');
  const [selectedDistrict, setSelectedDistrict] = useState<any | null>(null);
  const [districtStations, setDistrictStations] = useState<any[]>([]);
  const [zoomLevel, setZoomLevel] = useState(7);
  const [patrolRouteActive, setPatrolRouteActive] = useState(false);
  const patrolRouteLayerRef = useRef<L.LayerGroup | null>(null);

  const closePanel = useCallback(() => {
    setSelectedDistrict(null);
    setDistrictStations([]);
    setPatrolRouteActive(false);
    if (patrolRouteLayerRef.current) {
      patrolRouteLayerRef.current.clearLayers();
    }
  }, []);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!mapContainerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    import('leaflet').then((leaflet) => {
      const L = leaflet.default || leaflet;

      // Extra guard: check if container already has a map
      if ((mapContainerRef.current as any)?._leaflet_id) return;

      const map = L.map(mapContainerRef.current!, {
        center: [15.3173, 75.7139],
        zoom: 7,
        minZoom: 6,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark CartoDB tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Custom zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const districtInfoMap = getMapDistrictData();
      const policeStations = getMapStationData();

      // Station markers layer (hidden initially)
      const stationLayer = L.layerGroup();
      stationLayerRef.current = stationLayer;

      // Create station markers
      policeStations.forEach((ps) => {
        const marker = L.circleMarker([ps.lat, ps.lon], {
          radius: 5,
          fillColor: ps.type === 'cen' ? '#7c3aed' : '#00d4aa',
          fillOpacity: 0.8,
          color: '#0a0a0f',
          weight: 1,
        });
        marker.bindTooltip(
          `<div style="font-family:Inter,sans-serif;font-size:12px;background:#111118;color:#e8e8ed;padding:6px 10px;border:1px solid rgba(0,212,170,0.3);border-radius:6px;">
            <strong>${ps.name}</strong><br/>
            <span style="color:#8b8b9e">${ps.district} · ${ps.type.toUpperCase()}</span><br/>
            <span style="color:#00d4aa">Cases: ${ps.totalCases}</span> · <span style="color:#d4a574">Pending: ${ps.pendingCases}</span>
          </div>`,
          { className: styles.customTooltip, direction: 'top', offset: [0, -8] }
        );
        stationLayer.addLayer(marker);
      });

      // Fetch real GADM GeoJSON
      fetch('/data/karnataka_districts.json')
        .then((r) => r.json())
        .then((geojson) => {
          const geojsonLayer = L.geoJSON(geojson, {
            style: (feature) => {
              const name = feature?.properties?.NAME_2;
              const info = districtInfoMap[name];
              const risk = info?.riskLevel || 'low';
              return {
                fillColor: riskFillColors[risk],
                fillOpacity: riskFillOpacity[risk],
                color: '#00bfff',
                weight: 1.5,
                opacity: 0.6,
              };
            },
            onEachFeature: (feature, layer) => {
              const name = feature.properties?.NAME_2;
              const info = districtInfoMap[name];
              if (!info) return;

              // Tooltip
              layer.bindTooltip(
                `<div style="font-family:Inter,sans-serif;font-size:12px;background:#111118ee;color:#e8e8ed;padding:8px 12px;border:1px solid rgba(0,212,170,0.3);border-radius:8px;min-width:160px;">
                  <div style="font-weight:600;font-size:13px;margin-bottom:4px;">${info.displayName}</div>
                  <div style="display:flex;gap:12px;margin-bottom:2px;">
                    <span style="color:#00d4aa">Cases: ${info.totalCases.toLocaleString()}</span>
                  </div>
                  <div style="display:flex;gap:12px;">
                    <span style="color:#7c3aed">Cyber: ${info.cyberCases}</span>
                    <span style="color:#d4a574">Active: ${info.activeCases}</span>
                  </div>
                  <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.1);">
                    <span style="background:${riskFillColors[info.riskLevel]};color:#fff;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;text-transform:uppercase;">${info.riskLevel}</span>
                    <span style="color:#8b8b9e;margin-left:8px;font-size:11px;">${info.crimeRate}/100K</span>
                  </div>
                </div>`,
                { className: styles.customTooltip, sticky: true, direction: 'top' }
              );

              // Hover effect
              layer.on('mouseover', (e) => {
                const target = e.target;
                target.setStyle({
                  fillOpacity: Math.min((riskFillOpacity[info.riskLevel] || 0.1) + 0.25, 0.7),
                  weight: 3,
                  opacity: 1,
                  color: '#00ffdd',
                });
                target.bringToFront();
              });

              layer.on('mouseout', (e) => {
                geojsonLayer.resetStyle(e.target);
              });

              // Click — select district
              layer.on('click', () => {
                const stations = policeStations.filter(
                  (ps) => {
                    if (info.datasetDistricts && info.datasetDistricts.includes(ps.district)) return true;
                    // Fallback
                    const cleanPs = ps.district.toLowerCase().replace(' city', '').replace(' urban', '').replace(' rural', '').trim();
                    const cleanDisp = info.displayName.toLowerCase().replace(' city', '').replace(' urban', '').replace(' rural', '').trim();
                    const cleanGadm = (info.gadmName || '').toLowerCase().replace(' city', '').replace(' urban', '').replace(' rural', '').trim();
                    return cleanPs.includes(cleanDisp) || cleanPs.includes(cleanGadm) || cleanDisp.includes(cleanPs) || cleanGadm.includes(cleanPs);
                  }
                );
                setSelectedDistrict(info);
                setDistrictStations(stations);
                
                // Zoom to district
                const bounds = (layer as L.Polygon).getBounds();
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
              });
            },
          });

          geojsonLayer.addTo(map);
          geojsonLayerRef.current = geojsonLayer;
        });

      // Zoom level tracking
      map.on('zoomend', () => {
        const z = map.getZoom();
        setZoomLevel(z);
        
        if (z >= 10 && stationLayerRef.current && !map.hasLayer(stationLayerRef.current)) {
          stationLayerRef.current.addTo(map);
        } else if (z < 10 && stationLayerRef.current && map.hasLayer(stationLayerRef.current)) {
          map.removeLayer(stationLayerRef.current);
        }
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className={styles.mapWrapper}>
      {/* Scan-line overlay */}
      <div className={styles.scanlineOverlay} />

      {/* Filter bar */}
      <div className={styles.filterBar}>
        {filterTypes.map((f) => (
          <button
            key={f}
            className={`${styles.filterPill} ${activeFilter === f ? styles.filterActive : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Zoom level indicator */}
      <div className={styles.zoomIndicator}>
        <span className={styles.zoomLabel}>ZOOM</span>
        <span className={styles.zoomValue}>{zoomLevel}x</span>
        <span className={styles.zoomHint}>
          {zoomLevel <= 9 ? '▶ District View' : zoomLevel <= 12 ? '▶ Station View' : '▶ Street View'}
        </span>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendTitle}>Crime Intensity</div>
        <div className={styles.legendScale}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#1a6b4a' }} />
            Low
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#00d4aa' }} />
            Medium
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#d4a574' }} />
            High
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#ff3355' }} />
            Critical
          </div>
        </div>
        {zoomLevel <= 9 && (
          <div className={styles.legendHint}>Click district to drill down</div>
        )}
        {zoomLevel >= 10 && (
          <div className={styles.legendHint}>
            <span className={styles.legendDot} style={{ background: '#00d4aa', width: 6, height: 6 }} /> Police Station
            <span className={styles.legendDot} style={{ background: '#7c3aed', width: 6, height: 6, marginLeft: 8 }} /> CEN Station
          </div>
        )}
      </div>

      {/* Map container */}
      <div ref={mapContainerRef} className={styles.mapContainer} />

      {/* District info panel */}
      {selectedDistrict && (
        <div className={styles.infoPanel}>
          <button className={styles.closeBtn} onClick={closePanel}>✕</button>
          
          <div className={styles.panelHeader}>
            <h2 className={styles.districtName}>{selectedDistrict.displayName}</h2>
            <span
              className={styles.riskBadge}
              style={{ background: riskFillColors[selectedDistrict.riskLevel] }}
            >
              {selectedDistrict.riskLevel.toUpperCase()}
            </span>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{selectedDistrict.totalCases.toLocaleString()}</span>
              <span className={styles.statLabel}>Total Cases</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue} style={{ color: '#00d4aa' }}>{selectedDistrict.activeCases}</span>
              <span className={styles.statLabel}>Active</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue} style={{ color: '#7c3aed' }}>{selectedDistrict.cyberCases}</span>
              <span className={styles.statLabel}>Cyber</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue} style={{ color: '#d4a574' }}>{selectedDistrict.crimeRate}</span>
              <span className={styles.statLabel}>per 100K</span>
            </div>
          </div>

          {/* Crime type bars */}
          <div className={styles.crimeBreakdown}>
            <h3 className={styles.sectionTitle}>Crime Breakdown</h3>
            {[
              { label: 'Cybercrime', pct: Math.round((selectedDistrict.cyberCases / selectedDistrict.totalCases) * 100), color: '#7c3aed' },
              { label: 'Theft', pct: 28, color: '#d4a574' },
              { label: 'Assault', pct: 19, color: '#ff3355' },
              { label: 'Others', pct: 15, color: '#00d4aa' },
            ].map((item) => (
              <div key={item.label} className={styles.barRow}>
                <span className={styles.barLabel}>{item.label}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${item.pct}%`, background: item.color }}
                  />
                </div>
                <span className={styles.barPct}>{item.pct}%</span>
              </div>
            ))}
          </div>

          {/* Stations list */}
          {districtStations.length > 0 && (
            <div className={styles.stationsSection}>
              <h3 className={styles.sectionTitle}>Police Stations ({districtStations.length})</h3>
              {districtStations.slice(0, 5).map((ps) => (
                <div key={ps.id} className={styles.stationCard}>
                  <div className={styles.stationName}>{ps.name}</div>
                  <div className={styles.stationMeta}>
                    <span style={{ color: '#00d4aa' }}>{ps.totalCases} cases</span>
                    <span style={{ color: '#d4a574' }}>{ps.pendingCases} pending</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Patrol Route Button */}
          {districtStations.length >= 2 && (
            <button 
              className={styles.patrolBtn} 
              onClick={() => {
                if (!mapRef.current) return;
                // @ts-ignore
                const L = window.L;
                if (!L) return;

                if (patrolRouteLayerRef.current) {
                  patrolRouteLayerRef.current.clearLayers();
                } else {
                  patrolRouteLayerRef.current = L.layerGroup().addTo(mapRef.current);
                }

                if (patrolRouteActive) {
                  setPatrolRouteActive(false);
                  return;
                }

                const topStations = [...districtStations].sort((a, b) => b.totalCases - a.totalCases).slice(0, 5);
                
                // We need at least 3 points to make a meaningful polygon/area.
                if (topStations.length < 3) {
                  alert("Not enough stations in this district to define a patrol sector. (Minimum 3 needed)");
                  setPatrolRouteActive(false);
                  return;
                }

                const latlngs = topStations.map(ps => [ps.lat, ps.lon] as [number, number]);

                // Draw a closed polygon representing the patrol sector
                const route = L.polygon(latlngs, {
                  color: '#ff3355',
                  weight: 3,
                  opacity: 0.8,
                  fillColor: '#ff3355',
                  fillOpacity: 0.2,
                  dashArray: '10, 10',
                  lineCap: 'round',
                });
                patrolRouteLayerRef.current.addLayer(route);

                // Add a central label or just mark the hotspots
                topStations.forEach((ps, i) => {
                  const label = i === 0 ? `HQ: ${ps.name}` : ps.name;
                  const icon = L.divIcon({
                     className: 'custom-patrol-icon',
                     html: `<div style="background:#ff3355;color:#fff;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:10px;border:2px solid #fff;box-shadow:0 0 10px rgba(255,51,85,0.8);white-space:nowrap;">${label}</div>`,
                     iconAnchor: [15, 10]
                  });
                  L.marker([ps.lat, ps.lon], { icon }).addTo(patrolRouteLayerRef.current!);
                });

                setPatrolRouteActive(true);
                
                // Zoom to route
                mapRef.current.fitBounds(route.getBounds(), { padding: [50, 50] });
              }}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '16px',
                backgroundColor: patrolRouteActive ? 'rgba(255, 51, 85, 0.2)' : 'rgba(0, 212, 170, 0.1)',
                color: patrolRouteActive ? '#ff3355' : '#00d4aa',
                border: `1px solid ${patrolRouteActive ? '#ff3355' : '#00d4aa'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
              }}
            >
              {patrolRouteActive ? 'Clear Patrol Route' : 'Generate Optimal Patrol Route'}
            </button>
          )}

          <div className={styles.panelPop}>
            Pop: {(selectedDistrict.population / 1000000).toFixed(1)}M
          </div>
        </div>
      )}
    </div>
  );
}
