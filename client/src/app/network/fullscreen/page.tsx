'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { getNetworkGraphData, NetworkNode } from '@/data/dataService';
import NodeDetailPanel from '@/components/network/NodeDetailPanel';
import { Download } from 'lucide-react';

const NetworkGraph = dynamic(() => import('@/components/network/NetworkGraph'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0f', color: '#00d4aa' }}>
      Loading Network Graph...
    </div>
  ),
});

function FullscreenNetworkContent() {
  const searchParams = useSearchParams();
  const clusterIdParam = searchParams.get('clusterId');
  const activeCluster = clusterIdParam ? parseInt(clusterIdParam, 10) : null;

  const { nodes, edges, clusters } = useMemo(() => getNetworkGraphData(), []);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  const filteredNodes = useMemo(() => {
    if (activeCluster == null) return nodes;
    const cluster = clusters.find(c => c.id === activeCluster);
    if (!cluster) return nodes;
    return nodes.filter(n => cluster.members.includes(n.id));
  }, [nodes, activeCluster, clusters]);

  const filteredEdges = useMemo(() => {
    if (activeCluster == null) return edges;
    const cluster = clusters.find(c => c.id === activeCluster);
    if (!cluster) return edges;
    return edges.filter(e => cluster.members.includes(e.source) && cluster.members.includes(e.target));
  }, [edges, activeCluster, clusters]);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0a0a0f', position: 'relative', overflow: 'hidden' }}>
      {/* Header bar overlaid on top */}
      <div style={{ 
        position: 'absolute', 
        top: 0, left: 0, right: 0, 
        padding: '16px 24px', 
        background: 'linear-gradient(to bottom, rgba(10,10,15,0.9), transparent)', 
        zIndex: 50,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '24px',
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        <h1 style={{ color: '#00d4aa', margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>⬡</span> IRIS Tactical Network View
        </h1>
        <button 
          onClick={() => {
            document.dispatchEvent(new CustomEvent('export-network-pdf'));
          }}
          style={{
            background: 'rgba(0, 212, 170, 0.15)',
            border: '1px solid rgba(0, 212, 170, 0.3)',
            color: '#00d4aa',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Download size={16} /> Export PDF
        </button>
      </div>

      <NetworkGraph
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodeSelect={setSelectedNode}
        activeClusterId={null} // Passing null because we already filtered the data
        clusters={clusters}
      />

      {selectedNode && (
        <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}

export default function FullscreenNetworkPage() {
  return (
    <React.Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0f', color: '#00d4aa' }}>Loading...</div>}>
      <FullscreenNetworkContent />
    </React.Suspense>
  );
}
