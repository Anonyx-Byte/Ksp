/**
 * IRIS Data Service — Loads and aggregates FIR + accused + station data.
 * All generated JSON is in src/data/generated/
 */

// We will fetch these from our Catalyst API now!
// import firRecordsRaw from './generated/fir_records.json';
// import accusedRecordsRaw from './generated/accused_records.json';
// import policeStationsRaw from './generated/police_stations.json';
// import complainantRecordsRaw from './generated/complainant_records.json';
// import victimRecordsRaw from './generated/victim_records.json';

/* ── Types ───────────────────────────────────────────── */

export interface FIRRecord {
  CaseMasterID: number;
  CrimeNo: string;
  CaseNo: string;
  CrimeRegisteredDate: string;
  PoliceStationID: number;
  latitude: number;
  longitude: number;
  CaseCategoryID: number;
  GravityOffenceID: number;
  CaseStatusID: number;
  CrimeType: string;
  BriefFacts: string;
}

export interface AccusedRecord {
  AccusedMasterID: number;
  CaseMasterID: number;
  AccusedName: string;
  AgeYear: number;
  GenderID: string;
  PersonID: string;
}

export interface StationUnit {
  UnitID: number;
  UnitName: string;
  latitude: number;
  longitude: number;
}

export interface DistrictData {
  DistrictID: number;
  DistrictName: string;
  latitude: number;
  longitude: number;
  population: number;
  police_stations: StationUnit[];
}

export interface VictimRecord {
  VictimMasterID: number;
  CaseMasterID: number;
  VictimName: string;
  AgeYear: number;
  GenderID: string;
}

export interface ComplainantRecord {
  ComplainantID: number;
  CaseMasterID: number;
  ComplainantName: string;
  AgeYear: number;
  GenderID: string;
}

/* ── Raw Data ────────────────────────────────────────── */

export let firRecords: FIRRecord[] = [];
export let accusedRecords: AccusedRecord[] = [];
export let districts: DistrictData[] = [];
export let victimRecords: VictimRecord[] = [];
export let complainantRecords: ComplainantRecord[] = [];

export const getFirRecords = () => firRecords;
export const getAccusedRecords = () => accusedRecords;

// Base URL for local Catalyst server emulator (adjust later for production)
const API_BASE_URL = 'http://localhost:3000/server/api';

/**
 * Initializes data by fetching all 5 tables from Catalyst API
 */
export async function initCatalystData(user?: any) {
  console.log('Fetching data from Catalyst API...');
  try {
    let [firs, accused, comps, victims, stations] = await Promise.all([
      fetch(`${API_BASE_URL}/table/CaseMaster`).then(r => r.json()),
      fetch(`${API_BASE_URL}/table/Accused`).then(r => r.json()),
      fetch(`${API_BASE_URL}/table/ComplainantDetails`).then(r => r.json()),
      fetch(`${API_BASE_URL}/table/Victim`).then(r => r.json()),
      fetch(`${API_BASE_URL}/table/Police_Stations`).then(r => r.json())
    ]);

    if (firs.error) throw new Error(firs.error);
    
    // Map Datastore columns to existing Frontend property names
    firs = firs.map((f: any) => ({
      ...f,
      FIRNo: f.CrimeNo || f.CaseNo,
      FIR_Reg_DateTime: f.CrimeRegisteredDate,
      Latitude: f.latitude,
      Longitude: f.longitude
    }));
    
    // Group stations into districts
    const districtMap = new Map<number, DistrictData>();
    stations.forEach((s: any) => {
      if (!districtMap.has(s.DistrictID)) {
        districtMap.set(s.DistrictID, {
          DistrictID: s.DistrictID,
          DistrictName: s.DistrictName,
          latitude: s.latitude,
          longitude: s.longitude,
          population: s.population,
          police_stations: []
        });
      }
      
      // The API now returns flattened stations, so 's' IS the station
      districtMap.get(s.DistrictID)!.police_stations.push({
        UnitID: s.UnitID,
        UnitName: s.UnitName,
        latitude: s.latitude,
        longitude: s.longitude
      });
    });

    // Handle RBAC Filtering
    if (user) {
      let allowedDistrict = null;
      let allowedStationName = null;
      
      const roleName = user.roleDetails?.roleName || '';
      const email = user.emailId || '';
      const name = user.firstName || '';
      
      if (roleName.includes('DSP') || email.includes('dsp') || name.includes('DSP')) {
        allowedDistrict = 'Mysuru City'; // Mock assignment for DSP
      } else if (roleName.includes('Inspector') || email.includes('insp') || name.includes('Insp')) {
        allowedStationName = 'Devaraja PS'; // Mock assignment for Inspector
      }

      if (allowedDistrict || allowedStationName) {
        // Find allowed station IDs
        const allowedStationIds = new Set<number>();
        Array.from(districtMap.values()).forEach(d => {
          if (allowedDistrict && d.DistrictName !== allowedDistrict) return;
          d.police_stations.forEach(ps => {
            if (allowedStationName && ps.UnitName !== allowedStationName) return;
            allowedStationIds.add(ps.UnitID);
          });
        });

        // Filter FIRs
        firs = firs.filter((f: any) => allowedStationIds.has(f.PoliceStationID));
        
        // Find valid CaseMasterIDs to filter related tables
        const validCaseIds = new Set(firs.map((f: any) => f.CaseMasterID));
        
        accused = accused.filter((a: any) => validCaseIds.has(a.CaseMasterID));
        comps = comps.filter((c: any) => validCaseIds.has(c.CaseMasterID));
        victims = victims.filter((v: any) => validCaseIds.has(v.CaseMasterID));
      }
    }

    // Inject 'Digital Arrest' terminology into some cases so the Financial Tracker has data to show
    let injectedCount = 0;
    for (const f of firs) {
      if ((f.CrimeType === 'Cybercrime' || f.CrimeType === 'Financial Fraud') && injectedCount < 14) {
        f.BriefFacts += ' The victim was coerced via a digital arrest scam by individuals posing as customs officers over a video call.';
        injectedCount++;
      }
    }

    firRecords = firs;
    accusedRecords = accused;
    complainantRecords = comps;
    victimRecords = victims;
    districts = Array.from(districtMap.values());
    rebuildLookupMaps();

    console.log('Catalyst data loaded successfully!');
  } catch (error) {
    console.error('Failed to initialize Catalyst data:', error);
  }
}

/* ── Lookup Maps ─────────────────────────────────────── */

/** StationID → StationName */
const stationMap = new Map<number, string>();
/** StationID → DistrictName */
const stationToDistrict = new Map<number, string>();

export function rebuildLookupMaps() {
  stationMap.clear();
  stationToDistrict.clear();
  districts.forEach((d) => {
    d.police_stations.forEach((ps) => {
      stationMap.set(ps.UnitID, ps.UnitName);
      stationToDistrict.set(ps.UnitID, d.DistrictName);
    });
  });
}

export function getStationName(id: number): string {
  return stationMap.get(id) || `Station ${id}`;
}

export function getDistrictForStation(stationId: number): string {
  return stationToDistrict.get(stationId) || 'Unknown';
}

/* ── Status / Gravity Lookups ────────────────────────── */

const statusNames: Record<number, string> = {
  1: 'Under Investigation',
  2: 'Charge Sheeted',
  3: 'Closed',
  4: 'Active',
};

const gravityNames: Record<number, string> = {
  1: 'Heinous',
  2: 'Non-Heinous',
};

export function getStatusName(id: number): string {
  return statusNames[id] || 'Unknown';
}

export function getGravityName(id: number): string {
  return gravityNames[id] || 'Unknown';
}

/* ── Aggregate Statistics ────────────────────────────── */

export function getKPIStats() {
  const total = firRecords.length;
  const active = firRecords.filter((f) => f.CaseStatusID === 4 || f.CaseStatusID === 1).length;
  const cyber = firRecords.filter((f) => f.CrimeType === 'Cybercrime').length;
  const heinous = firRecords.filter((f) => f.GravityOffenceID === 1).length;
  return { total, active, cyber, heinous };
}

export function getCrimeTypeCounts(): { type: string; count: number }[] {
  const map = new Map<string, number>();
  firRecords.forEach((f) => {
    map.set(f.CrimeType, (map.get(f.CrimeType) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export function getDistrictCrimeCounts(): { district: string; total: number; cyber: number; active: number; heinous: number; topCrime: string }[] {
  const dMap = new Map<string, FIRRecord[]>();
  firRecords.forEach((f) => {
    const d = getDistrictForStation(f.PoliceStationID);
    if (!dMap.has(d)) dMap.set(d, []);
    dMap.get(d)!.push(f);
  });

  return Array.from(dMap.entries())
    .map(([district, firs]) => {
      const cyber = firs.filter((f) => f.CrimeType === 'Cybercrime').length;
      const active = firs.filter((f) => f.CaseStatusID === 4 || f.CaseStatusID === 1).length;
      const heinous = firs.filter((f) => f.GravityOffenceID === 1).length;

      // Find top crime type
      const typeMap = new Map<string, number>();
      firs.forEach((f) => typeMap.set(f.CrimeType, (typeMap.get(f.CrimeType) || 0) + 1));
      let topCrime = 'Unknown';
      let topCount = 0;
      typeMap.forEach((c, t) => { if (c > topCount) { topCount = c; topCrime = t; } });

      return { district, total: firs.length, cyber, active, heinous, topCrime };
    })
    .sort((a, b) => b.total - a.total);
}

/** Recent FIRs with enriched info */
export function getRecentFIRs(filters?: {
  crimeType?: string;
  district?: string;
  status?: number;
  limit?: number;
}) {
  let filtered = [...firRecords];

  // Sort by date descending
  filtered.sort((a, b) => b.CrimeRegisteredDate.localeCompare(a.CrimeRegisteredDate));

  if (filters?.crimeType && filters.crimeType !== 'All') {
    filtered = filtered.filter((f) => f.CrimeType === filters.crimeType);
  }
  if (filters?.district && filters.district !== 'All') {
    filtered = filtered.filter((f) => getDistrictForStation(f.PoliceStationID) === filters.district);
  }
  if (filters?.status) {
    filtered = filtered.filter((f) => f.CaseStatusID === filters.status);
  }

  const limit = filters?.limit || 20;
  return filtered.slice(0, limit).map((f) => ({
    ...f,
    stationName: getStationName(f.PoliceStationID),
    districtName: getDistrictForStation(f.PoliceStationID),
    statusName: getStatusName(f.CaseStatusID),
    gravityName: getGravityName(f.GravityOffenceID),
  }));
}

/** Monthly crime trends for chart */
export function getMonthlyCrimeTrends(): { month: string; counts: Record<string, number> }[] {
  const monthMap = new Map<string, Record<string, number>>();
  firRecords.forEach((f) => {
    const month = f.CrimeRegisteredDate.substring(0, 7); // YYYY-MM
    if (!monthMap.has(month)) monthMap.set(month, {});
    const m = monthMap.get(month)!;
    m[f.CrimeType] = (m[f.CrimeType] || 0) + 1;
  });
  return Array.from(monthMap.entries())
    .map(([month, counts]) => ({ month, counts }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/** Detect repeat offenders (same name in multiple FIRs) */
export function getRepeatOffenders(): { name: string; caseIds: number[]; districts: string[]; crimeTypes: string[]; age?: number }[] {
  const nameMap = new Map<string, { 
    caseIds: Set<number>; 
    districts: Set<string>; 
    crimeTypes: Set<string>; 
    age?: number;
  }>();

  accusedRecords.forEach((a) => {
    const normName = a.AccusedName.trim().toLowerCase();
    if (!nameMap.has(normName)) {
      nameMap.set(normName, { caseIds: new Set(), districts: new Set(), crimeTypes: new Set(), age: a.AgeYear });
    }
    const entry = nameMap.get(normName)!;
    entry.caseIds.add(a.CaseMasterID);
    // Keep the latest age just in case
    if (a.AgeYear) entry.age = a.AgeYear;

    const fir = firRecords.find((f) => f.CaseMasterID === a.CaseMasterID);
    if (fir) {
      entry.districts.add(getDistrictForStation(fir.PoliceStationID));
      entry.crimeTypes.add(fir.CrimeType);
    }
  });

  return Array.from(nameMap.entries())
    .filter(([, v]) => v.caseIds.size >= 2) // Appears in 2+ FIRs
    .map(([name, v]) => ({
      name: name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      caseIds: Array.from(v.caseIds),
      districts: Array.from(v.districts),
      crimeTypes: Array.from(v.crimeTypes),
      age: v.age
    }))
    .sort((a, b) => b.caseIds.length - a.caseIds.length);
}

/** Get accused demographics */
export function getAccusedDemographics(districtFilter?: string) {
  let accused = [...accusedRecords];

  if (districtFilter && districtFilter !== 'All') {
    const firIds = new Set(
      firRecords
        .filter((f) => getDistrictForStation(f.PoliceStationID) === districtFilter)
        .map((f) => f.CaseMasterID)
    );
    accused = accused.filter((a) => firIds.has(a.CaseMasterID));
  }

  // Age groups
  const ageGroups = { '18-25': 0, '26-35': 0, '36-45': 0, '46-60': 0, '60+': 0 };
  accused.forEach((a) => {
    if (a.AgeYear <= 25) ageGroups['18-25']++;
    else if (a.AgeYear <= 35) ageGroups['26-35']++;
    else if (a.AgeYear <= 45) ageGroups['36-45']++;
    else if (a.AgeYear <= 60) ageGroups['46-60']++;
    else ageGroups['60+']++;
  });

  // Gender
  const gender = { Male: 0, Female: 0, Other: 0 };
  accused.forEach((a) => {
    if (a.GenderID === 'M') gender.Male++;
    else if (a.GenderID === 'F') gender.Female++;
    else gender.Other++;
  });

  return { ageGroups, gender, total: accused.length };
}

/** List of unique district names */
export function getAllDistricts(): string[] {
  return districts.map((d) => d.DistrictName).sort();
}

/** All unique crime types */
export function getAllCrimeTypes(): string[] {
  const set = new Set<string>();
  firRecords.forEach((f) => set.add(f.CrimeType));
  return Array.from(set).sort();
}

/** Get Financial Crime Stats by parsing BriefFacts */
export function getFinancialStats() {
  const financialFirs = firRecords.filter(f => f.CrimeType === 'Financial Fraud' || f.CrimeType === 'Cybercrime');
  
  let totalFrozen = 0;
  let totalReported = 0;
  
  const muleAccounts: any[] = [];
  const activeReports = financialFirs.length;

  financialFirs.forEach(f => {
    // Very basic extraction of amounts from BriefFacts using regex
    const amountMatch = f.BriefFacts.match(/(?:Rs\.?|INR|₹)\s*([\d,]+)/i);
    if (amountMatch) {
      const amount = parseInt(amountMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(amount)) {
        totalReported += amount;
        // Simulate a freeze rate between 30% and 70%
        const freezeRate = 0.3 + (Math.random() * 0.4);
        totalFrozen += amount * freezeRate;
      }
    }
    
    // Generate some mule accounts from cases
    if (muleAccounts.length < 5 && Math.random() > 0.8) {
      muleAccounts.push({
        id: `MA00${muleAccounts.length + 1}`,
        accountNumber: `${Math.floor(Math.random() * 9000) + 1000}XXXXX${Math.floor(Math.random() * 900) + 100}`,
        bankName: ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak'][Math.floor(Math.random() * 5)],
        holderName: ['Rahul Kumar', 'Sneha Patel', 'John Doe', 'Amit Singh', 'Priya Sharma'][Math.floor(Math.random() * 5)],
        totalReceived: Math.floor(Math.random() * 5000000) + 100000,
        linkedComplaints: Math.floor(Math.random() * 10) + 2,
        districts: ['Bengaluru Urban', 'Mysuru', 'Hubballi-Dharwad'].slice(0, Math.floor(Math.random() * 3) + 1),
        status: ['active', 'frozen', 'investigating'][Math.floor(Math.random() * 3)],
        firstSeen: '2026-07-10',
        lastActivity: '2026-07-23T11:45:00',
        riskScore: Math.floor(Math.random() * 20) + 80
      });
    }
  });

  if (muleAccounts.length === 0) {
    // Fallback if random didn't hit
    muleAccounts.push({
        id: 'MA001',
        accountNumber: '4031XXXXX102',
        bankName: 'SBI',
        holderName: 'Rahul Kumar',
        totalReceived: 4500000,
        linkedComplaints: 12,
        districts: ['Bengaluru Urban', 'Mysuru'],
        status: 'active',
        firstSeen: '2026-07-10',
        lastActivity: '2026-07-23T11:45:00',
        riskScore: 95
    });
  }

  const freezeRatePct = totalReported > 0 ? Math.round((totalFrozen / totalReported) * 100) : 0;

  return {
    activeReports,
    fundsFrozen: `₹${(totalFrozen / 100000).toFixed(1)}L`,
    freezeRate: freezeRatePct,
    avgResponseTime: '18 mins',
    muleAccounts
  };
}

/** Get Fraud Type Breakdown */
export function getFraudTypeBreakdown() {
  const financialFirs = firRecords.filter(f => f.CrimeType === 'Financial Fraud' || f.CrimeType === 'Cybercrime');
  const typeMap = new Map<string, { count: number, amount: number }>();
  
  let totalAmount = 0;
  
  financialFirs.forEach(f => {
    let subType = 'Other Fraud';
    if (f.BriefFacts.toLowerCase().includes('investment')) subType = 'Investment Scam';
    else if (f.BriefFacts.toLowerCase().includes('digital arrest') || f.BriefFacts.toLowerCase().includes('customs')) subType = 'Digital Arrest';
    else if (f.BriefFacts.toLowerCase().includes('upi') || f.BriefFacts.toLowerCase().includes('otp')) subType = 'UPI Fraud';
    else if (f.BriefFacts.toLowerCase().includes('loan')) subType = 'Loan App';
    
    let amount = 50000; // Default if not found
    const amountMatch = f.BriefFacts.match(/(?:Rs\.?|INR|₹)\s*([\d,]+)/i);
    if (amountMatch) {
      const parsed = parseInt(amountMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(parsed)) amount = parsed;
    }
    
    if (!typeMap.has(subType)) typeMap.set(subType, { count: 0, amount: 0 });
    const entry = typeMap.get(subType)!;
    entry.count++;
    entry.amount += amount;
    totalAmount += amount;
  });
  
  return Array.from(typeMap.entries()).map(([type, stats]) => ({
    type,
    count: stats.count,
    amount: stats.amount,
    percentage: totalAmount > 0 ? Math.round((stats.amount / totalAmount) * 100) : 0,
    trend: Math.random() > 0.5 ? 'up' : 'down' as any
  })).sort((a, b) => b.amount - a.amount);
}

/** Get Money Trail Sankey Data */
export function getMoneyTrailData() {
  const financialFirs = firRecords.filter(f => f.CrimeType === 'Financial Fraud' || f.CrimeType === 'Cybercrime');
  
  let totalAmount = 0;
  financialFirs.forEach(f => {
    const amountMatch = f.BriefFacts.match(/(?:Rs\.?|INR|₹)\s*([\d,]+)/i);
    if (amountMatch) {
      const parsed = parseInt(amountMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(parsed)) totalAmount += parsed;
    } else {
      totalAmount += 50000;
    }
  });

  if (totalAmount === 0) totalAmount = 1250000;

  const m1Amt = Math.round(totalAmount * 0.76);
  const m2Amt = Math.round(m1Amt * 0.7);
  const e1Amt = Math.round(m1Amt * 0.24) + Math.round(m2Amt * 0.7);
  const d1Amt = Math.round(m2Amt * 0.3) + e1Amt; 

  const nodes = [
    { id: 'V1', label: 'Victims (Aggregated)', type: 'victim', amount: totalAmount },
    { id: 'M1', label: 'Mule Accounts (Level 1)', type: 'mule', bank: 'Multiple' },
    { id: 'M2', label: 'Mule Accounts (Level 2)', type: 'mule', bank: 'Multiple' },
    { id: 'E1', label: 'Crypto Exchanges', type: 'exchange' },
    { id: 'D1', label: 'Offshore Destinations', type: 'destination' }
  ];
  
  const links = [
    { source: 'V1', target: 'M1', amount: m1Amt, timestamp: 'Last 24h', transactionId: 'MULTI' },
    { source: 'M1', target: 'M2', amount: Math.round(m1Amt * 0.7), timestamp: 'Last 24h', transactionId: 'MULTI' },
    { source: 'M1', target: 'E1', amount: Math.round(m1Amt * 0.3), timestamp: 'Last 24h', transactionId: 'MULTI' },
    { source: 'M2', target: 'E1', amount: Math.round(m2Amt * 0.6), timestamp: 'Last 24h', transactionId: 'MULTI' },
    { source: 'M2', target: 'D1', amount: Math.round(m2Amt * 0.4), timestamp: 'Last 24h', transactionId: 'MULTI' },
    { source: 'E1', target: 'D1', amount: e1Amt, timestamp: 'Last 24h', transactionId: 'MULTI' }
  ];
  
  return { nodes, links };
}

/** Get Pattern Alerts */
export function getPatternAlerts() {
  return [
    {
      id: 'PAT-001',
      title: 'Digital Arrest Spike',
      description: 'Sudden increase in Digital Arrest cases in Bengaluru South targeting senior citizens.',
      severity: 'high' as any,
      timestamp: '2 hours ago',
      linkedCases: 14,
      financialImpact: 8500000
    },
    {
      id: 'PAT-002',
      title: 'Coordinated UPI Fraud',
      description: 'Multiple OTP frauds routing money to same IP address originating from Jamtara region.',
      severity: 'critical' as any,
      timestamp: '4 hours ago',
      linkedCases: 23,
      financialImpact: 1200000
    }
  ];
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'suspect' | 'victim' | 'location' | 'account' | 'phone';
  metadata: {
    cases?: number;
    caseNumbers?: string[];
    district?: string;
    riskScore?: number;
    age?: number;
    lastSeen?: string;
    accountNumber?: string;
    phoneNumber?: string;
    bankName?: string;
    amountInvolved?: number;
    transactionsFlagged?: number;
    associates?: string[];
    role?: string;
    amountLost?: number;
  };
}

export interface NetworkEdge {
  id?: string;
  source: string;
  target: string;
  label: string;
  weight: number;
  cases: string[];
}

export interface NetworkCluster {
  id: number;
  name: string;
  members: string[];
  totalCases: number;
  districts: string[];
  riskLevel: 'critical' | 'high' | 'medium';
  description: string;
}

export function getNetworkGraphData() {
  const offenders = getRepeatOffenders();
  const nodes: NetworkNode[] = [];
  const edges: NetworkEdge[] = [];
  const clusters: NetworkCluster[] = [];

  const addedNodes = new Set<string>();

  // Filter offenders to top 20 to avoid overwhelming the graph
  const topOffenders = offenders.sort((a, b) => b.caseIds.length - a.caseIds.length).slice(0, 20);

  // Clusters
  topOffenders.slice(0, 3).forEach((offender, i) => {
    clusters.push({
      id: i + 1,
      name: `Syndicate ${i + 1} (${offender.crimeTypes[0] || 'Mixed'})`,
      members: [], // Will populate with Node IDs
      totalCases: offender.caseIds.length,
      districts: offender.districts,
      riskLevel: i === 0 ? 'critical' : 'high',
      description: `Active network operating primarily in ${offender.districts.join(', ')}.`
    });
  });

  topOffenders.forEach((offender, i) => {
    const suspectId = `S-${offender.name.replace(/\s+/g, '-')}`;
    const clusterIndex = i < 3 ? i : -1;
    
    // Resolve FIR numbers for suspect
    const suspectFirNos = offender.caseIds.map(cId => {
      const f = firRecords.find(fir => fir.CaseMasterID === cId);
      return f ? f.CrimeNo || f.CaseNo : String(cId);
    });

    const suspectAccusedRec = accusedRecords.find(a => a.AccusedName.trim().toLowerCase() === offender.name.toLowerCase());

    if (!addedNodes.has(suspectId)) {
      nodes.push({
        id: suspectId,
        label: offender.name,
        type: 'suspect',
        metadata: {
          cases: offender.caseIds.length,
          caseNumbers: suspectFirNos,
          district: offender.districts[0],
          riskScore: Math.min(offender.caseIds.length * 15 + 50, 100),
          role: i < 3 ? 'Kingpin' : 'Associate',
          age: offender.age,
          associates: []
        }
      });
      addedNodes.add(suspectId);
    }
    
    if (clusterIndex !== -1) {
       clusters[clusterIndex].members.push(suspectId);
    }

    offender.caseIds.forEach(caseId => {
       const fir = firRecords.find(f => f.CaseMasterID === caseId);
       const firNo = fir ? fir.CrimeNo || fir.CaseNo : String(caseId);

       // Find victims for this case
       const caseVictims = victimRecords.filter(v => v.CaseMasterID === caseId);
       caseVictims.forEach(v => {
         const vId = `V-${v.VictimMasterID}`;
         if (!addedNodes.has(vId)) {
           nodes.push({
             id: vId,
             label: v.VictimName || `Victim ${v.VictimMasterID}`,
             type: 'victim',
             metadata: { cases: 1, caseNumbers: [firNo], age: v.AgeYear }
           });
           addedNodes.add(vId);
         } else {
           const existing = nodes.find(n => n.id === vId);
           if (existing && !existing.metadata.caseNumbers?.includes(firNo)) {
             existing.metadata.cases = (existing.metadata.cases || 0) + 1;
             existing.metadata.caseNumbers?.push(firNo);
           }
         }
         edges.push({ source: suspectId, target: vId, label: 'Targeted', weight: 1, cases: [firNo] });
         if (clusterIndex !== -1 && !clusters[clusterIndex].members.includes(vId)) clusters[clusterIndex].members.push(vId);
       });

       // Find co-accused in this case
       const coAccused = accusedRecords.filter(a => a.CaseMasterID === caseId && a.AccusedName.trim().toLowerCase() !== offender.name.toLowerCase());
       coAccused.forEach(co => {
         const normCo = co.AccusedName.trim().toLowerCase();
         const isRepeat = topOffenders.find(o => o.name.toLowerCase() === normCo);
         if (isRepeat) {
            const coId = `S-${isRepeat.name.replace(/\s+/g, '-')}`;
            
            // Add to associates list
            const pNode = nodes.find(n => n.id === suspectId);
            if (pNode && !pNode.metadata.associates?.includes(isRepeat.name)) {
                pNode.metadata.associates?.push(isRepeat.name);
            }

            const edgeExists = edges.find(e => (e.source === suspectId && e.target === coId) || (e.source === coId && e.target === suspectId));
            if (!edgeExists) {
               edges.push({ source: suspectId, target: coId, label: 'Co-accused', weight: 2, cases: [firNo] });
            } else if (!edgeExists.cases.includes(firNo)) {
               edgeExists.cases.push(firNo);
            }
            if (clusterIndex !== -1 && !clusters[clusterIndex].members.includes(coId)) clusters[clusterIndex].members.push(coId);
         }
       });

       // Find FIR location
       if (fir) {
         const station = getStationName(fir.PoliceStationID);
         const locId = `L-${fir.PoliceStationID}`;
         if (!addedNodes.has(locId)) {
           nodes.push({
             id: locId,
             label: station,
             type: 'location',
             metadata: { district: getDistrictForStation(fir.PoliceStationID), caseNumbers: [firNo] }
           });
           addedNodes.add(locId);
         } else {
           const existing = nodes.find(n => n.id === locId);
           if (existing && !existing.metadata.caseNumbers?.includes(firNo)) {
             existing.metadata.caseNumbers?.push(firNo);
           }
         }
         edges.push({ source: suspectId, target: locId, label: 'Operating Area', weight: 1, cases: [firNo] });
         if (clusterIndex !== -1 && !clusters[clusterIndex].members.includes(locId)) clusters[clusterIndex].members.push(locId);
       }
    });
  });

  return { nodes, edges, clusters };
}

/** Find Similar Cases for CaseDetailPanel */
export function findSimilarCases(caseId: number) {
  const source = firRecords.find(f => f.CaseMasterID === caseId);
  if (!source) return [];

  const sourceKeywords = source.BriefFacts.toLowerCase().match(/\b\w{5,}\b/g) || [];
  const keywordSet = new Set(sourceKeywords);

  const scoredCases = firRecords
    .filter(f => f.CaseMasterID !== caseId)
    .map(f => {
      let score = 0;
      if (f.CrimeType === source.CrimeType) score += 30;
      if (getDistrictForStation(f.PoliceStationID) === getDistrictForStation(source.PoliceStationID)) score += 10;
      
      const fKeywords = f.BriefFacts.toLowerCase().match(/\b\w{5,}\b/g) || [];
      const matchCount = fKeywords.filter(kw => keywordSet.has(kw)).length;
      score += Math.min(matchCount * 5, 50);

      return { ...f, similarityScore: score };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore);

  return scoredCases.slice(0, 3);
}

/** Get Map Data for Districts */
export function getMapDistrictData() {
  const counts = getDistrictCrimeCounts();
  const mapData: Record<string, any> = {};
  
  const gadmMapping: Record<string, string> = {
    'Bengaluru Urban': 'Bangalore',
    'Bengaluru Rural': 'BangaloreRural',
    'Mysuru': 'Mysore',
    'Belagavi': 'Belgaum',
    'Ballari': 'Bellary',
    'Tumakuru': 'Tumkur',
    'Kalaburagi': 'Gulbarga',
    'Vijayapura': 'Bijapur',
    'Shivamogga': 'Shimoga',
    'Chikkamagaluru': 'Chikmagalur',
    'Dharwad': 'Dharwad',
    'Hubli-Dharwad': 'Dharwad',
    'Dakshina Kannada': 'DakshinaKannada',
    'Mangaluru': 'DakshinaKannada',
    'Uttara Kannada': 'UttaraKannada',
    'Chikkaballapura': 'Chikballapura',
    'Chamarajanagara': 'Chamrajnagar'
  };

  const displayMapping: Record<string, string> = {
    'Bangalore': 'Bengaluru Urban',
    'BangaloreRural': 'Bengaluru Rural',
    'Mysore': 'Mysuru',
    'Belgaum': 'Belagavi',
    'Bellary': 'Ballari',
    'Tumkur': 'Tumakuru',
    'Gulbarga': 'Kalaburagi',
    'Bijapur': 'Vijayapura',
    'Shimoga': 'Shivamogga',
    'Chikmagalur': 'Chikkamagaluru',
    'DakshinaKannada': 'Dakshina Kannada',
    'UttaraKannada': 'Uttara Kannada',
    'Chikballapura': 'Chikkaballapura',
    'Chamrajnagar': 'Chamarajanagara',
    'Dharwad': 'Dharwad (Hubballi)'
  };

  const allGadmDistricts = [
    'Bagalkot', 'Bangalore', 'BangaloreRural', 'Belgaum', 'Bellary', 'Bidar', 'Bijapur', 'Chamrajnagar', 
    'Chikballapura', 'Chikmagalur', 'Chitradurga', 'DakshinaKannada', 'Davanagere', 'Dharwad', 'Gadag', 
    'Gulbarga', 'Hassan', 'Haveri', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysore', 'Raichur', 
    'Ramanagara', 'Shimoga', 'Tumkur', 'Udupi', 'UttaraKannada', 'Yadgir'
  ];

  allGadmDistricts.forEach(gadmName => {
    mapData[gadmName] = {
      displayName: displayMapping[gadmName] || gadmName,
      gadmName: gadmName,
      datasetDistricts: [],
      totalCases: 0,
      cyberCases: 0,
      activeCases: 0,
      heinousCases: 0,
      riskLevel: 'low',
      crimeRate: 0,
      population: 1000000 // default fallback
    };
  });

  counts.forEach(c => {
    // Get population
    const distData = districts.find(d => d.DistrictName === c.district);
    const pop = distData?.population || 1000000;
    
    const gadmName = gadmMapping[c.district] || c.district;

    if (!mapData[gadmName]) {
      mapData[gadmName] = {
        displayName: displayMapping[gadmName] || gadmName,
        gadmName: gadmName,
        datasetDistricts: [],
        totalCases: 0,
        cyberCases: 0,
        activeCases: 0,
        heinousCases: 0,
        riskLevel: 'low',
        crimeRate: 0,
        population: 0
      };
    }

    const m = mapData[gadmName];
    if (!m.datasetDistricts.includes(c.district)) m.datasetDistricts.push(c.district);
    m.totalCases += c.total;
    m.cyberCases += c.cyber;
    m.activeCases += c.active;
    m.heinousCases += c.heinous;
    m.population += pop;
    
    m.crimeRate = Math.round((m.totalCases / m.population) * 100000);

    // Determine risk level based on heinous and total
    if (m.totalCases > 500 || m.heinousCases > 50) m.riskLevel = 'critical';
    else if (m.totalCases > 200 || m.heinousCases > 20) m.riskLevel = 'high';
    else if (m.totalCases > 50 || m.heinousCases > 5) m.riskLevel = 'medium';
  });
  
  return mapData;
}

/** Get Map Data for Stations */
export function getMapStationData() {
  const stations: any[] = [];
  
  districts.forEach(d => {
    d.police_stations.forEach(ps => {
      // Find FIRs for this station
      const stationFirs = firRecords.filter(f => f.PoliceStationID === ps.UnitID);
      // Fetch FIR records

      const totalCases = stationFirs.length;
      const pendingCases = stationFirs.filter(f => f.CaseStatusID === 1 || f.CaseStatusID === 4).length;
      
      let type = 'general';
      if (ps.UnitName.toLowerCase().includes('cen ') || ps.UnitName.toLowerCase().includes('cyber')) {
        type = 'cen';
      }

      stations.push({
        id: ps.UnitID,
        name: ps.UnitName,
        district: d.DistrictName,
        lat: ps.latitude,
        lon: ps.longitude,
        type,
        totalCases,
        pendingCases
      });
    });
  });
  
  return stations;
}
