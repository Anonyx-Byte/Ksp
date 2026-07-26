/**
 * NetworkGraph.tsx — Cytoscape.js criminal network visualization
 * Renders an interactive force-directed graph with node hover highlighting,
 * cluster filtering, edge type coloring, and animated layout.
 */
'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import cytoscape, { Core } from 'cytoscape';
import styles from './NetworkGraph.module.css';
import { NetworkNode, NetworkEdge, NetworkCluster } from '@/data/dataService';

interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  onNodeSelect: (node: NetworkNode | null) => void;
  activeClusterId?: number | null;
  clusters?: NetworkCluster[];
}

export default function NetworkGraph({
  nodes,
  edges,
  onNodeSelect,
  activeClusterId,
  clusters,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  /* ── Stable callback so the effect doesn't re-run on every render ── */
  const onNodeSelectRef = useRef(onNodeSelect);
  onNodeSelectRef.current = onNodeSelect;

  const handleNodeSelect = useCallback((node: NetworkNode | null) => {
    onNodeSelectRef.current(node);
  }, []);

  /* ── Initialize Cytoscape ─────────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current) return;

    /* Map data to Cytoscape element format */
    const cyNodes = nodes.map((n) => ({
      data: {
        id: n.id,
        label: n.label,
        type: n.type,
        cases: n.metadata.cases || 0,
        riskScore: n.metadata.riskScore || 0,
      },
    }));

    const cyEdges = edges.map((e) => ({
      data: {
        id: e.id || `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        label: e.label,
        weight: e.weight,
      },
    }));

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...cyNodes, ...cyEdges],

      /* ── Visual stylesheet ───────────────────────────────── */
      style: [
        /* Base node style */
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#ffffff',
            'font-size': '10px',
            'font-family': 'Inter, sans-serif',
            'font-weight': 600,
            'text-valign': 'bottom',
            'text-margin-y': 8,
            'text-outline-width': 2,
            'text-outline-color': '#0f172a',
            'background-color': '#334155',
            'width': 22,
            'height': 22,
            'border-width': 1.5,
            'border-color': 'rgba(255,255,255,0.4)',
            'transition-property': 'opacity, border-color, border-width, width, height, shadow-opacity, shadow-blur, shadow-color',
            'transition-duration': '0.3s' as any,
          } as any,
        },
        /* Suspect nodes */
        {
          selector: 'node[type="suspect"]',
          style: {
            'background-color': '#ff3355',
            'border-width': 2,
            'border-color': '#111118',
            'label': 'data(label)',
            'width': 'mapData(cases, 1, 15, 24, 48)',
            'height': 'mapData(cases, 1, 15, 24, 48)',
            'shadow-blur': 15,
            'shadow-color': '#ff3355',
            'shadow-opacity': 0.6,
          } as any,
        },
        /* Victim nodes */
        {
          selector: 'node[type="victim"]',
          style: {
            'background-color': '#38bdf8',
            'border-color': '#7dd3fc',
            'shape': 'ellipse',
            'width': 18,
            'height': 18,
            'shadow-blur': 10,
            'shadow-color': '#38bdf8',
            'shadow-opacity': 0.5,
          } as any,
        },
        /* Location nodes */
        {
          selector: 'node[type="location"]',
          style: {
            'background-color': '#2dd4bf',
            'border-color': '#5eead4',
            'shape': 'diamond',
            'width': 24,
            'height': 24,
            'shadow-blur': 10,
            'shadow-color': '#2dd4bf',
            'shadow-opacity': 0.5,
          } as any,
        },
        /* Account nodes */
        {
          selector: 'node[type="account"]',
          style: {
            'background-color': '#a855f7',
            'border-color': '#d8b4fe',
            'shape': 'hexagon',
            'width': 28,
            'height': 28,
            'shadow-blur': 10,
            'shadow-color': '#a855f7',
            'shadow-opacity': 0.5,
          } as any,
        },
        /* Phone nodes */
        {
          selector: 'node[type="phone"]',
          style: {
            'background-color': '#fbbf24',
            'border-color': '#fcd34d',
            'shape': 'triangle',
            'width': 22,
            'height': 22,
            'shadow-blur': 10,
            'shadow-color': '#fbbf24',
            'shadow-opacity': 0.5,
          } as any,
        },

        /* ── Edge styles ─────────────────────────────────── */
        {
          selector: 'edge',
          style: {
            'width': 'mapData(weight, 1, 5, 1, 3)',
            'line-color': '#334155',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '8px',
            'font-family': 'JetBrains Mono, monospace',
            'color': '#94a3b8',
            'text-rotation': 'autorotate',
            'text-margin-y': -8,
            'text-outline-width': 2,
            'text-outline-color': '#0f172a',
            'opacity': 0.6,
            'transition-property': 'opacity, line-color, width, shadow-blur, shadow-opacity, shadow-color',
            'transition-duration': '0.3s' as any,
          } as any,
        },
        /* Edge type colorization */
        {
          selector: 'edge[label="co-accused"]',
          style: { 
            'line-color': '#f43f5e', 
            'target-arrow-color': '#f43f5e',
            'shadow-blur': 8,
            'shadow-color': '#f43f5e',
            'shadow-opacity': 0.4,
          } as any,
        },
        {
          selector: 'edge[label="money-transfer"]',
          style: {
            'line-color': '#a855f7',
            'target-arrow-color': '#a855f7',
            'target-arrow-shape': 'triangle',
            'shadow-blur': 8,
            'shadow-color': '#a855f7',
            'shadow-opacity': 0.4,
          } as any,
        },
        {
          selector: 'edge[label="phone-contact"]',
          style: {
            'line-color': '#fbbf24',
            'line-style': 'dashed',
            'target-arrow-color': '#fbbf24',
          },
        },
        {
          selector: 'edge[label="same-location"]',
          style: { 
            'line-color': '#2dd4bf', 
            'target-arrow-color': '#2dd4bf',
            'shadow-blur': 8,
            'shadow-color': '#2dd4bf',
            'shadow-opacity': 0.4,
          } as any,
        },
        {
          selector: 'edge[label="recruited"]',
          style: {
            'line-color': '#38bdf8',
            'line-style': 'dotted',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#38bdf8',
          },
        },

        /* ── State classes ───────────────────────────────── */
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 3,
            'border-color': '#00d4aa',
            'z-index': 20,
          },
        },
        {
          selector: 'node.dimmed',
          style: { 'opacity': 0.15 },
        },
        {
          selector: 'edge.dimmed',
          style: { 'opacity': 0.05 },
        },
        {
          selector: 'node.hover-highlight',
          style: {
            'border-width': 3,
            'border-color': '#00d4aa',
            'z-index': 20,
          },
        },
        {
          selector: 'edge.hover-highlight',
          style: {
            'opacity': 1,
            'z-index': 20,
          },
        },
        {
          selector: 'node.hover-dim',
          style: { 'opacity': 0.12 },
        },
        {
          selector: 'edge.hover-dim',
          style: { 'opacity': 0.04 },
        },
      ],

      /* ── Cose (Compound Spring Embedder) Layout ──────────────────────── */
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 800,
        padding: 50,
        nodeRepulsion: 400000,
        idealEdgeLength: 100,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 250,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      } as any,

      /* ── Interaction options ────────────────────────────── */
      wheelSensitivity: 0.3,
      minZoom: 0.3,
      maxZoom: 3,
    });

    /* ── Event: tap node → show detail panel ─────────────── */
    cy.on('tap', 'node', (evt) => {
      const nodeData = evt.target.data();
      const fullNode = nodes.find((n) => n.id === nodeData.id);
      if (fullNode) handleNodeSelect(fullNode);
    });

    /* ── Event: tap background → deselect ────────────────── */
    cy.on('tap', (evt) => {
      if (evt.target === cy) handleNodeSelect(null);
    });

    /* ── Event: hover → neighborhood highlight ───────────── */
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      const neighborhood = node.neighborhood().union(node);
      cy.elements().not(neighborhood).addClass('hover-dim');
      neighborhood.addClass('hover-highlight');
    });

    cy.on('mouseout', 'node', () => {
      cy.elements().removeClass('hover-dim').removeClass('hover-highlight');
    });

    cyRef.current = cy;

    const handleExportPdf = async () => {
      if (!cyRef.current) return;
      const { jsPDF } = await import('jspdf');
      // @ts-ignore
      const b64 = cyRef.current.png({ bg: '#0a0a0f', full: false, scale: 1, output: 'base64' });
      const pdf = new jsPDF({ orientation: 'landscape' });
      const imgProps = pdf.getImageProperties(b64);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(b64, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('IRIS_Network_Export.pdf');
    };
    document.addEventListener('export-network-pdf', handleExportPdf);

    return () => {
      document.removeEventListener('export-network-pdf', handleExportPdf);
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, handleNodeSelect]);

  /* ── Cluster filtering effect ────────────────────────────── */
  useEffect(() => {
    if (!cyRef.current || !clusters) return;

    cyRef.current.elements()
      .removeClass('dimmed')
      .removeClass('highlighted');

    if (activeClusterId != null) {
      const cluster = clusters.find((c) => c.id === activeClusterId);
      if (cluster) {
        const members = cluster.members;
        cyRef.current.nodes().forEach((node) => {
          if (members.includes(node.id())) {
            node.addClass('highlighted');
          } else {
            node.addClass('dimmed');
          }
        });
        cyRef.current.edges().forEach((edge) => {
          const srcIn = members.includes(edge.source().id());
          const tgtIn = members.includes(edge.target().id());
          if (!(srcIn && tgtIn)) {
            edge.addClass('dimmed');
          }
        });
      }
    }
  }, [activeClusterId, clusters]);

  return (
    <div className={styles.container}>
      <div ref={containerRef} className={styles.canvas} />
      {/* Scanline overlay for sci-fi feel */}
      <div className={styles.scanlines} />
      {/* Corner decorations */}
      <div className={`${styles.corner} ${styles.cornerTL}`} />
      <div className={`${styles.corner} ${styles.cornerTR}`} />
      <div className={`${styles.corner} ${styles.cornerBL}`} />
      <div className={`${styles.corner} ${styles.cornerBR}`} />
    </div>
  );
}
