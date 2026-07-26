'use client';

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import styles from './MoneyTrailSankey.module.css';
import { getMoneyTrailData } from '../../data/dataService';

/**
 * MoneyTrailSankey — visualizes the flow of fraudulent funds from victims
 * through mule accounts, exchanges, and into final destinations.
 * 
 * Uses ECharts Sankey series with:
 * - Distinct node colors per entity type (cyan/amber/purple/crimson)
 * - Source-colored links for traceability
 * - Adjacency emphasis on hover for path highlighting
 * - Smooth load animation
 */
export default function MoneyTrailSankey() {
  const { nodes: dataNodes, links: dataLinks } = useMemo(() => getMoneyTrailData(), []);

  const option = useMemo<EChartsOption>(() => {
    /** Map node type → color */
    const getColorByType = (type: string): string => {
      switch (type) {
        case 'victim':      return '#00bfff'; // cyan
        case 'mule':        return '#d4a574'; // amber / sandstone
        case 'exchange':    return '#7c3aed'; // purple
        case 'destination': return '#ff3355'; // crimson
        default:            return '#00d4aa'; // teal fallback
      }
    };

    /** Build node data with glow on victim nodes */
    const nodes = dataNodes.map((n) => {
      const color = getColorByType(n.type);
      const isVictim = n.type === 'victim';

      return {
        name: n.label,
        itemStyle: {
          color,
          borderColor: '#0a0a0f',
          borderWidth: 1,
          /* Subtle glow for victim nodes to draw attention */
          ...(isVictim && {
            shadowColor: 'rgba(0, 191, 255, 0.45)',
            shadowBlur: 10,
          }),
        },
      };
    });

    /** Build link data — resolve IDs to labels */
    const links = dataLinks
      .map((l) => {
        const sourceNode = dataNodes.find((n) => n.id === l.source);
        const targetNode = dataNodes.find((n) => n.id === l.target);
        return {
          source: sourceNode?.label ?? '',
          target: targetNode?.label ?? '',
          value: l.amount,
        };
      })
      .filter((l) => l.source && l.target);

    return {
      backgroundColor: 'transparent',

      /* In-chart title — muted, top-left */
      title: {
        text: 'Live Money Trail Map',
        left: 8,
        top: 4,
        textStyle: {
          color: '#555566',
          fontSize: 12,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400 as const,
        },
      },

      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        backgroundColor: '#111118',
        borderColor: 'rgba(0,212,170,0.3)',
        textStyle: { color: '#e8e8ed', fontSize: 12, fontFamily: 'Inter, sans-serif' },
        formatter: (params: any) => {
          if (params.dataType === 'edge') {
            const amtLakhs = (params.data.value / 100000).toFixed(1);
            return `<span style="color:#8b8b9e">${params.data.source}</span> → <span style="color:#8b8b9e">${params.data.target}</span><br/>Amount: <strong style="color:#00d4aa">₹${amtLakhs}L</strong>`;
          }
          return `<strong>${params.name}</strong>`;
        },
      },

      series: [
        {
          type: 'sankey',
          orient: 'horizontal',
          nodeWidth: 20,
          nodeGap: 16,
          nodeAlign: 'left',
          layoutIterations: 32,
          emphasis: {
            focus: 'adjacency',
          },
          lineStyle: {
            color: 'source',
            opacity: 0.25,
            curveness: 0.5,
          },
          itemStyle: {
            borderWidth: 1,
            borderColor: '#0a0a0f',
          },
          label: {
            color: '#e8e8ed',
            fontSize: 11,
            fontFamily: 'Inter, sans-serif',
          },
          data: nodes,
          links,
          animationDuration: 1500,
          animationEasing: 'cubicOut',
        },
      ],
    };
  }, []);

  return (
    <div className={`glass-card ${styles.container}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 className={styles.title}>Live Money Trail Map</h3>
        <div style={{ fontSize: '10px', color: '#8b8b9e', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', cursor: 'help' }} title="This graph aggregates total reported losses from ALL active financial/cyber FIRs, showing macro-level funds flow based on known laundering typologies. For specific IP overlaps or micro-tracking, see Pattern Alerts.">
          ℹ How it works
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge
        />
      </div>

      {/* Color legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ backgroundColor: '#00bfff', boxShadow: '0 0 6px rgba(0,191,255,0.5)' }} />
          Victims
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ backgroundColor: '#d4a574' }} />
          Mule Accounts
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ backgroundColor: '#7c3aed' }} />
          Exchanges
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ backgroundColor: '#ff3355' }} />
          Destinations
        </div>
      </div>
    </div>
  );
}
