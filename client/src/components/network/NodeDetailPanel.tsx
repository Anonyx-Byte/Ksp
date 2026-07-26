/**
 * NodeDetailPanel.tsx — Slide-in detail panel for network graph nodes
 * Shows contextual information based on node type (suspect, victim, account, phone, location).
 * Features a CSS-based risk score gauge for suspect nodes.
 */
'use client';

import React from 'react';
import styles from './NodeDetailPanel.module.css';
import { NetworkNode } from '@/data/dataService';

interface NodeDetailPanelProps {
  node: NetworkNode | null;
  onClose: () => void;
}

/** Returns a color based on risk score thresholds */
function riskColor(score: number): string {
  if (score >= 85) return '#ff3355';   // Critical
  if (score >= 65) return '#d4a574';   // High/Warning
  if (score >= 40) return '#00bfff';   // Medium
  return '#00d4aa';                    // Low
}

/** Returns a label based on risk score thresholds */
function riskLabel(score: number): string {
  if (score >= 85) return 'CRITICAL';
  if (score >= 65) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

export default function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) return null;

  const risk = node.metadata.riskScore || 0;

  return (
    <div className={styles.panel}>
      {/* ── Header ──────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{node.label}</h3>
          <span className={`${styles.typeBadge} ${styles[`type_${node.type}`]}`}>
            {node.type.toUpperCase()}
          </span>
          {node.metadata.role && (
            <span className={styles.roleBadge}>{node.metadata.role}</span>
          )}
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className={styles.content}>

        {/* SUSPECT NODE */}
        {node.type === 'suspect' && (
          <>
            {/* Risk Score Gauge */}
            <div className={styles.gaugeSection}>
              <div className={styles.gaugeLabel}>Risk Score</div>
              <div className={styles.gaugeTrack}>
                <div
                  className={styles.gaugeFill}
                  style={{
                    width: `${risk}%`,
                    background: `linear-gradient(90deg, ${riskColor(risk)}88, ${riskColor(risk)})`,
                    boxShadow: `0 0 12px ${riskColor(risk)}66`,
                  }}
                />
                <span className={styles.gaugeValue} style={{ color: riskColor(risk) }}>
                  {risk}
                </span>
              </div>
              <div className={styles.gaugeRiskLabel} style={{ color: riskColor(risk) }}>
                {riskLabel(risk)}
              </div>
            </div>

            {/* Suspect details */}
            <div className={styles.detailGrid}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Age</span>
                <span className={styles.detailValue}>{node.metadata.age || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>District</span>
                <span className={styles.detailValue}>{node.metadata.district || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Cases Linked ({node.metadata.cases || 0})</span>
                <span className={styles.detailValue}>
                  {node.metadata.caseNumbers && node.metadata.caseNumbers.length > 0 ? (
                     <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#ff3355' }}>
                       {node.metadata.caseNumbers.map((cno, i) => (
                         <li key={i}>{cno}</li>
                       ))}
                     </ul>
                  ) : (
                     node.metadata.cases || 0
                  )}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Last Seen</span>
                <span className={styles.detailValue}>{node.metadata.lastSeen || '—'}</span>
              </div>
            </div>

            {/* Associates */}
            {node.metadata.associates && node.metadata.associates.length > 0 && (
              <div className={styles.associatesSection}>
                <div className={styles.sectionTitle}>Known Associates</div>
                <div className={styles.associatesList}>
                  {node.metadata.associates.map((name, i) => (
                    <span key={i} className={styles.associateChip}>{name}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* VICTIM NODE */}
        {node.type === 'victim' && (
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Age</span>
              <span className={styles.detailValue}>{node.metadata.age || '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>District</span>
              <span className={styles.detailValue}>{node.metadata.district || '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Related Cases</span>
              <span className={styles.detailValue}>{node.metadata.cases || 0}</span>
            </div>
            {node.metadata.amountLost && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Amount Lost</span>
                <span className={styles.detailValue} style={{ color: '#ff3355' }}>
                  ₹{node.metadata.amountLost.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ACCOUNT NODE */}
        {node.type === 'account' && (
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Bank / Platform</span>
              <span className={styles.detailValue}>{node.metadata.bankName || '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Account No.</span>
              <span className={styles.detailValue} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
                {node.metadata.accountNumber || '—'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Amount Involved</span>
              <span className={styles.detailValue} style={{ color: '#7c3aed' }}>
                ₹{(node.metadata.amountInvolved || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Flagged Txns</span>
              <span className={styles.detailValue} style={{ color: '#ff3355' }}>
                {node.metadata.transactionsFlagged || 0}
              </span>
            </div>
          </div>
        )}

        {/* PHONE NODE */}
        {node.type === 'phone' && (
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Phone Number</span>
              <span className={styles.detailValue} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {node.metadata.phoneNumber || '—'}
              </span>
            </div>
          </div>
        )}

        {/* LOCATION NODE */}
        {node.type === 'location' && (
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Area</span>
              <span className={styles.detailValue}>{node.label}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>District</span>
              <span className={styles.detailValue}>{node.metadata.district || '—'}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ─────────────────────────────────────── */}
      <div className={styles.actions}>
        <button className={styles.btnInvestigate} onClick={() => window.alert(`Investigating ${node.id}`)}>
          <span className={styles.btnIcon}>🔍</span>
          Investigate
        </button>
        <button className={styles.btnSecondary} onClick={() => window.alert(`Profile of ${node.id} shared.`)}>
          <span className={styles.btnIcon}>🔗</span>
          Find Connections
        </button>
      </div>
    </div>
  );
}
