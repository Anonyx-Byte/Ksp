/**
 * Network Page — Criminal Network Graph Visualization
 * Displays an interactive force-directed graph of criminal networks
 * with cluster filtering, node detail panels, and a legend overlay.
 */
'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { getNetworkGraphData, NetworkNode } from '@/data/dataService';
import { Download, Filter, Maximize, Minimize } from 'lucide-react';
import NodeDetailPanel from '@/components/network/NodeDetailPanel';
import PageBanner from '@/components/layout/PageBanner';

/* Dynamically import NetworkGraph — Cytoscape needs browser APIs */
const NetworkGraph = dynamic(() => import('@/components/network/NetworkGraph'), {
  ssr: false,
  loading: () => (
    <div className={styles.graphLoading}>
      <div className={styles.loadingPulse} />
      <span>Initializing Network Graph…</span>
    </div>
  ),
});

export default function NetworkPage() {
  const { nodes, edges, clusters: networkClusters } = useMemo(() => getNetworkGraphData(), []);
  
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [activeCluster, setActiveCluster] = useState<number | null>(networkClusters.length > 0 ? networkClusters[0].id : null);
  const [showFilters, setShowFilters] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  /* Computed stats */
  const numNodes = nodes.length;
  const numEdges = edges.length;
  const numCritical = nodes.filter(
    (n) => n.type === 'suspect' && (n.metadata.riskScore || 0) >= 85
  ).length;

  /* Filter graph data to only show the active cluster's nodes */
  const filteredNodes = useMemo(() => {
    if (activeCluster == null) return nodes;
    const cluster = networkClusters.find(c => c.id === activeCluster);
    if (!cluster) return nodes;
    return nodes.filter(n => cluster.members.includes(n.id));
  }, [nodes, activeCluster, networkClusters]);

  const filteredEdges = useMemo(() => {
    if (activeCluster == null) return edges;
    const cluster = networkClusters.find(c => c.id === activeCluster);
    if (!cluster) return edges;
    return edges.filter(e => cluster.members.includes(e.source) && cluster.members.includes(e.target));
  }, [edges, activeCluster, networkClusters]);

  /* Risk level badge style helper */
  const riskBadgeClass = (level: string) => {
    switch (level) {
      case 'critical': return styles.badgeCritical;
      case 'high': return styles.badgeHigh;
      case 'medium': return styles.badgeMedium;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <PageBanner
        titleAccent="Criminal Network"
        title="Analysis"
        subtitle="Relationship mapping and gang detection intelligence"
        imageSrc="/images/network_banner.jpg"
      />

      {/* ── Stats Bar ──────────────────────────────────────── */}
      <div className={styles.statsBar}>
        <div className={styles.statsBarLeft}>
          <h2 className={styles.pageTitle}>
          <button
            className={styles.iconBtn}
            title="Export Graph Data"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes: filteredNodes, edges: filteredEdges }, null, 2));
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href", dataStr);
              downloadAnchorNode.setAttribute("download", "network_graph_export.json");
              document.body.appendChild(downloadAnchorNode); // required for firefox
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
            }}
          >
            <Download size={18} />
          </button>
            <span className={styles.titleIcon}>⬡</span>
            Criminal Network Graph
          </h2>
          <span className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            LIVE
          </span>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.statChip}>
            <span className={styles.statNumber}>{networkClusters.length}</span>
            <span className={styles.statLabel}>Networks</span>
          </div>
          <div className={styles.statChip}>
            <span className={styles.statNumber}>{numNodes}</span>
            <span className={styles.statLabel}>Total DB Nodes</span>
          </div>
          <div className={styles.statChip}>
            <span className={styles.statNumber}>{filteredNodes.length}</span>
            <span className={styles.statLabel}>Shown Nodes</span>
          </div>
          <div className={`${styles.statChip} ${styles.statCritical}`}>
            <span className={styles.statNumber}>{numCritical}</span>
            <span className={styles.statLabel}>Critical</span>
          </div>
        </div>
      </div>

      {/* ── Main Graph Area ────────────────────────────────── */}
      <div className={styles.mainArea}>
        <div className={styles.graphWrapper}>
          <a 
            href={`/network/fullscreen${activeCluster ? `?clusterId=${activeCluster}` : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.expandBtn} 
            title="Open Graph in Fullscreen Tab"
          >
            <Maximize size={20} />
          </a>
          <NetworkGraph
            nodes={filteredNodes}
            edges={filteredEdges}
            onNodeSelect={setSelectedNode}
            activeClusterId={null} // Passing null because we already filtered the data
            clusters={networkClusters}
          />
        
          {/* Node Detail Panel (rendered inside graphWrapper so it stays on top in fullscreen) */}
          {selectedNode && (
            <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
          )}
        </div>

        {/* ── Bottom Panel for Syndicates ────────────────────── */}
        <div className={styles.bottomPanel}>
          <div className={styles.bottomPanelHeader}>
             <h3>Criminal Syndicates</h3>
             <span className={styles.panelSubtitle}>Select a network to filter the graph</span>
          </div>
          
          <div className={styles.syndicatesList}>
            {networkClusters.map((c) => (
              <button
                key={c.id}
                className={`${styles.syndicateCard} ${activeCluster === c.id ? styles.syndicateCardActive : ''}`}
                onClick={() => setActiveCluster(c.id === activeCluster ? null : c.id)}
              >
                <div className={styles.synHeader}>
                  <span className={`${styles.riskDot} ${riskBadgeClass(c.riskLevel)}`} />
                  <span className={styles.synName}>{c.name}</span>
                  <span className={styles.filterCount}>{c.members.length} nodes</span>
                </div>
                {activeCluster === c.id && (
                  <div className={styles.synDetails}>
                    <div className={styles.clusterRiskHeader}>
                      <span className={`${styles.clusterRisk} ${riskBadgeClass(c.riskLevel)}`}>
                        {c.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                    <div className={styles.clusterDesc}>{c.description}</div>
                    <div className={styles.clusterDistricts}>📍 {c.districts.join(' • ')}</div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Legend Overlay ─────────────────────────────────── */}
      <div className={styles.legend}>
        <div className={styles.legendTitle}>LEGEND</div>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#ff3355' }} />
            Suspect
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#00bfff' }} />
            Victim
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendShape} style={{ background: '#00d4aa', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
            Location
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendShape} style={{ background: '#7c3aed', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
            Account
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendShape} style={{ background: '#d4a574', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            Phone
          </div>
        </div>
        <div className={styles.legendDivider} />
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: '#ff3355' }} />
            Co-accused
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: '#7c3aed' }} />
            Money Transfer
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendLineDashed} style={{ borderColor: '#d4a574' }} />
            Phone Contact
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: '#00d4aa' }} />
            Same Location
          </div>
        </div>
      </div>
    </div>
  );
}
