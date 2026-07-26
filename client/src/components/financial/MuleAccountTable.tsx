'use client';

import React, { useState } from 'react';
import styles from './MuleAccountTable.module.css';
import { getFinancialStats } from '../../data/dataService';

export interface MuleAccountAlert {
  id: string;
  accountNumber: string;
  bankName: string;
  holderName: string;
  totalReceived: number;
  linkedComplaints: number;
  districts: string[];
  status: 'active' | 'frozen' | 'investigating';
  firstSeen: string;
  lastActivity: string;
  riskScore: number;
}

type SortKey = keyof MuleAccountAlert;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function MuleAccountTable() {
  const { muleAccounts } = getFinancialStats();
  const [data, setData] = useState<MuleAccountAlert[]>(muleAccounts);
  const [sortKey, setSortKey] = useState<SortKey>('riskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    const isDesc = sortKey === key && sortOrder === 'desc';
    const newOrder = isDesc ? 'asc' : 'desc';
    setSortKey(key);
    setSortOrder(newOrder);

    const sortedData = [...data].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return newOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return newOrder === 'desc' ? bVal - aVal : aVal - bVal;
      }
      return 0;
    });
    setData(sortedData);
  };

  const getStatusClass = (status: string) => {
    if (status === 'active') return styles.statusActive;
    if (status === 'frozen') return styles.statusFrozen;
    return styles.statusInvestigating;
  };

  return (
    <div className={`glass-card ${styles.container}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Flagged Mule Accounts</h3>
        <button className={styles.exportBtn} onClick={() => window.alert('Exporting to CSV...')}>Export CSV</button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('accountNumber')}>Account {sortKey === 'accountNumber' && (sortOrder === 'desc' ? '↓' : '↑')}</th>
              <th onClick={() => handleSort('bankName')}>Bank {sortKey === 'bankName' && (sortOrder === 'desc' ? '↓' : '↑')}</th>
              <th onClick={() => handleSort('holderName')}>Holder {sortKey === 'holderName' && (sortOrder === 'desc' ? '↓' : '↑')}</th>
              <th onClick={() => handleSort('totalReceived')}>Total Received {sortKey === 'totalReceived' && (sortOrder === 'desc' ? '↓' : '↑')}</th>
              <th onClick={() => handleSort('linkedComplaints')}>Complaints {sortKey === 'linkedComplaints' && (sortOrder === 'desc' ? '↓' : '↑')}</th>
              <th>Districts</th>
              <th onClick={() => handleSort('status')}>Status {sortKey === 'status' && (sortOrder === 'desc' ? '↓' : '↑')}</th>
              <th onClick={() => handleSort('riskScore')}>Risk {sortKey === 'riskScore' && (sortOrder === 'desc' ? '↓' : '↑')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td className={styles.monoFont}>{row.accountNumber}</td>
                <td>{row.bankName}</td>
                <td>{row.holderName}</td>
                <td className={styles.monoFont}>{formatCurrency(row.totalReceived)}</td>
                <td className={styles.monoFont}>{row.linkedComplaints}</td>
                <td>{row.districts.join(', ')}</td>
                <td>
                  <span className={`${styles.badge} ${getStatusClass(row.status)}`}>
                    {row.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div className={styles.riskContainer}>
                    <span className={styles.monoFont}>{row.riskScore}</span>
                    <div className={styles.riskTrack}>
                      <div 
                        className={styles.riskFill} 
                        style={{ 
                          width: `${row.riskScore}%`,
                          backgroundColor: row.riskScore > 90 ? 'var(--accent-crimson)' : row.riskScore > 75 ? 'var(--accent-amber)' : 'var(--accent-emerald)'
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
