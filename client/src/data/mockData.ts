export type KPIStat = {
  id: string;
  label: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  icon: string;
  color: string;
};

export type FIRItem = {
  id: string;
  firNumber: string;
  crimeType: string;
  district: string;
  policeStation: string;
  timeAgo: string;
  severity: 'heinous' | 'non-heinous';
  status: string;
};

export type Alert = {
  id: string;
  type: string;
  title: string;
  description: string;
  district: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
};

export const kpiStats: KPIStat[] = [
  { id: '1', label: 'Total FIRs', value: '1,248', change: '+12.5%', changeType: 'up', icon: '📝', color: 'var(--accent-cyan)' },
  { id: '2', label: 'Active Cases', value: '4,892', change: '-3.2%', changeType: 'down', icon: '🔍', color: 'var(--accent-amber)' },
  { id: '3', label: 'Cybercrime Cases', value: '342', change: '+24.8%', changeType: 'up', icon: '💻', color: 'var(--accent-purple)' },
  { id: '4', label: 'Anomalies Detected', value: '14', change: '+2', changeType: 'up', icon: '⚠️', color: 'var(--accent-crimson)' }
];

export const recentFIRs: FIRItem[] = [
  { id: 'fir-1', firNumber: 'FIR-2023-0892', crimeType: 'Cyber Fraud', district: 'Bengaluru Urban', policeStation: 'Cyber Crime PS', timeAgo: '10m ago', severity: 'heinous', status: 'Active' },
  { id: 'fir-2', firNumber: 'FIR-2023-0891', crimeType: 'Narcotics (NDPS)', district: 'Mysuru', policeStation: 'Devaraja PS', timeAgo: '45m ago', severity: 'heinous', status: 'Active' },
  { id: 'fir-3', firNumber: 'FIR-2023-0890', crimeType: 'Theft', district: 'Hubballi-Dharwad', policeStation: 'Suburban PS', timeAgo: '1h ago', severity: 'non-heinous', status: 'Investigating' },
  { id: 'fir-4', firNumber: 'FIR-2023-0889', crimeType: 'Assault', district: 'Mangaluru', policeStation: 'Kadri PS', timeAgo: '2h ago', severity: 'non-heinous', status: 'Active' },
  { id: 'fir-5', firNumber: 'FIR-2023-0888', crimeType: 'Financial Fraud', district: 'Bengaluru Rural', policeStation: 'Nelamangala PS', timeAgo: '3h ago', severity: 'heinous', status: 'Active' },
  { id: 'fir-6', firNumber: 'FIR-2023-0887', crimeType: 'Burglary', district: 'Belagavi', policeStation: 'Camp PS', timeAgo: '4h ago', severity: 'non-heinous', status: 'Investigating' },
  { id: 'fir-7', firNumber: 'FIR-2023-0886', crimeType: 'Extortion', district: 'Kalaburagi', policeStation: 'Chowk PS', timeAgo: '5h ago', severity: 'heinous', status: 'Active' },
  { id: 'fir-8', firNumber: 'FIR-2023-0885', crimeType: 'Vandalism', district: 'Shivamogga', policeStation: 'Doddapete PS', timeAgo: '6h ago', severity: 'non-heinous', status: 'Closed' },
  { id: 'fir-9', firNumber: 'FIR-2023-0884', crimeType: 'Organized Crime', district: 'Bengaluru Urban', policeStation: 'CCB', timeAgo: '8h ago', severity: 'heinous', status: 'Active' },
  { id: 'fir-10', firNumber: 'FIR-2023-0883', crimeType: 'Vehicle Theft', district: 'Tumakuru', policeStation: 'Town PS', timeAgo: '12h ago', severity: 'non-heinous', status: 'Investigating' }
];

export const activeAlerts: Alert[] = [
  {
    id: 'alt-1',
    type: 'Network Anomaly',
    title: 'Surge in Phishing Cases',
    description: 'Detected 45 similar FIRs related to electricity bill phishing scams in the last 24 hours.',
    district: 'Bengaluru Urban',
    timestamp: 'Just now',
    severity: 'critical'
  },
  {
    id: 'alt-2',
    type: 'Pattern Match',
    title: 'Repeat Offender Activity',
    description: 'Facial recognition match at Kempegowda Bus Station against watch-list subject #8921.',
    district: 'Bengaluru Urban',
    timestamp: '2h ago',
    severity: 'critical'
  },
  {
    id: 'alt-3',
    type: 'Financial Intelligence',
    title: 'Suspicious Transactions',
    description: 'High volume of micro-transactions detected linked to known mule accounts.',
    district: 'Statewide',
    timestamp: '5h ago',
    severity: 'warning'
  }
];
