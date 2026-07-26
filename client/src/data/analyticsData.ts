export const crimeTrendData = {
  months: [
    'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025',
    'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025',
    'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026'
  ],
  cyber: [800, 850, 920, 980, 1050, 1100, 1250, 1380, 1450, 1600, 1720, 1850, 1920, 1980, 2050, 2120, 2180, 2250],
  theft: [1200, 1220, 1210, 1250, 1300, 1280, 1350, 1320, 1290, 1310, 1340, 1380, 1360, 1390, 1410, 1380, 1400, 1420],
  violent: [600, 590, 585, 580, 610, 570, 560, 550, 545, 560, 540, 530, 520, 515, 510, 505, 500, 495],
  financial: [400, 410, 430, 450, 480, 500, 530, 580, 620, 680, 710, 750, 790, 830, 850, 880, 910, 930]
};

export const districtRiskData = [
  { district: 'Bengaluru Urban', riskScore: 95, riskLevel: 'Critical', totalCases: 45000, trend: 'up' },
  { district: 'Mysuru', riskScore: 72, riskLevel: 'High', totalCases: 12000, trend: 'up' },
  { district: 'Hubli-Dharwad', riskScore: 65, riskLevel: 'High', totalCases: 9500, trend: 'stable' },
  { district: 'Mangaluru', riskScore: 58, riskLevel: 'Medium', totalCases: 7800, trend: 'down' },
  { district: 'Belagavi', riskScore: 55, riskLevel: 'Medium', totalCases: 8200, trend: 'stable' },
  { district: 'Kalaburagi', riskScore: 52, riskLevel: 'Medium', totalCases: 6500, trend: 'up' },
  { district: 'Shivamogga', riskScore: 48, riskLevel: 'Medium', totalCases: 5400, trend: 'down' },
  { district: 'Davangere', riskScore: 45, riskLevel: 'Medium', totalCases: 4800, trend: 'stable' },
  { district: 'Tumakuru', riskScore: 42, riskLevel: 'Low', totalCases: 4200, trend: 'down' },
  { district: 'Ballari', riskScore: 40, riskLevel: 'Low', totalCases: 3800, trend: 'stable' },
  { district: 'Vijayapura', riskScore: 38, riskLevel: 'Low', totalCases: 3500, trend: 'stable' },
  { district: 'Udupi', riskScore: 36, riskLevel: 'Low', totalCases: 3100, trend: 'down' },
  { district: 'Dakshina Kannada', riskScore: 35, riskLevel: 'Low', totalCases: 2900, trend: 'stable' },
  { district: 'Dharwad', riskScore: 34, riskLevel: 'Low', totalCases: 2700, trend: 'stable' },
  { district: 'Hassan', riskScore: 32, riskLevel: 'Low', totalCases: 2500, trend: 'down' },
  { district: 'Mandya', riskScore: 30, riskLevel: 'Low', totalCases: 2300, trend: 'stable' },
  { district: 'Raichur', riskScore: 28, riskLevel: 'Low', totalCases: 2100, trend: 'stable' },
  { district: 'Bidar', riskScore: 26, riskLevel: 'Low', totalCases: 1900, trend: 'stable' },
  { district: 'Chitradurga', riskScore: 25, riskLevel: 'Low', totalCases: 1800, trend: 'down' },
  { district: 'Koppal', riskScore: 24, riskLevel: 'Low', totalCases: 1700, trend: 'stable' },
  { district: 'Bagalkot', riskScore: 22, riskLevel: 'Low', totalCases: 1600, trend: 'stable' },
  { district: 'Kolar', riskScore: 20, riskLevel: 'Low', totalCases: 1500, trend: 'down' },
  { district: 'Chikkaballapur', riskScore: 19, riskLevel: 'Low', totalCases: 1400, trend: 'stable' },
  { district: 'Yadgir', riskScore: 18, riskLevel: 'Low', totalCases: 1300, trend: 'stable' },
  { district: 'Ramanagara', riskScore: 17, riskLevel: 'Low', totalCases: 1200, trend: 'stable' },
  { district: 'Uttara Kannada', riskScore: 16, riskLevel: 'Low', totalCases: 1100, trend: 'down' },
  { district: 'Chikkamagaluru', riskScore: 15, riskLevel: 'Low', totalCases: 1000, trend: 'stable' },
  { district: 'Haveri', riskScore: 14, riskLevel: 'Low', totalCases: 950, trend: 'stable' },
  { district: 'Gadag', riskScore: 13, riskLevel: 'Low', totalCases: 900, trend: 'stable' },
  { district: 'Chamarajanagar', riskScore: 12, riskLevel: 'Low', totalCases: 850, trend: 'down' },
  { district: 'Kodagu', riskScore: 10, riskLevel: 'Low', totalCases: 700, trend: 'stable' }
];

export const crimeTypologyData = [
  {
    name: 'Cybercrime',
    value: 35,
    children: [
      { name: 'Investment Scam', value: 15.75 },
      { name: 'Digital Arrest', value: 10.5 },
      { name: 'UPI Fraud', value: 5.25 },
      { name: 'Others', value: 3.5 }
    ]
  },
  {
    name: 'Property',
    value: 25,
    children: [
      { name: 'Burglary', value: 10 },
      { name: 'Vehicle Theft', value: 8 },
      { name: 'Snatching', value: 5 },
      { name: 'Others', value: 2 }
    ]
  },
  {
    name: 'Violent',
    value: 15,
    children: [
      { name: 'Assault', value: 8 },
      { name: 'Robbery', value: 4 },
      { name: 'Homicide', value: 2 },
      { name: 'Others', value: 1 }
    ]
  },
  {
    name: 'Financial',
    value: 12,
    children: [
      { name: 'Bank Fraud', value: 5 },
      { name: 'Extortion', value: 4 },
      { name: 'Forgery', value: 3 }
    ]
  },
  {
    name: 'Narcotics',
    value: 8,
    children: [
      { name: 'Trafficking', value: 5 },
      { name: 'Possession', value: 3 }
    ]
  },
  {
    name: 'Others',
    value: 5,
    children: [
      { name: 'Misc', value: 5 }
    ]
  }
];

const generateAnomalyData = () => {
  const dates = [];
  const baselines = [];
  const upperBounds = [];
  const actuals = [];
  const anomalyPoints = [];
  
  let currentBaseline = 200;
  
  const today = new Date('2026-07-23');
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
    
    currentBaseline = currentBaseline + (Math.random() * 4 - 2);
    baselines.push(Math.round(currentBaseline));
    
    const stdDev = 25;
    upperBounds.push(Math.round(currentBaseline + (stdDev * 2)));
    
    let isAnomaly = false;
    let actual = 0;
    
    if ([80, 60, 45, 25, 10].includes(i)) {
      isAnomaly = true;
      actual = Math.round(currentBaseline + (stdDev * 2) + 20 + Math.random() * 50);
      anomalyPoints.push({
        date: dates[dates.length - 1],
        value: actual,
        description: 'Unusual spike in activity detected'
      });
    } else {
      actual = Math.round(currentBaseline + (Math.random() * stdDev * 1.5 - stdDev * 0.75));
    }
    actuals.push(actual);
  }
  
  return { dates, baselines, upperBounds, actuals, anomalyPoints };
};

export const anomalyData = generateAnomalyData();

export const demographicData = {
  ageGroups: [
    { name: '18-25', value: 35 },
    { name: '26-35', value: 30 },
    { name: '36-45', value: 20 },
    { name: '46-55', value: 10 },
    { name: '56+', value: 5 }
  ],
  gender: [
    { name: 'Male', value: 82 },
    { name: 'Female', value: 15 },
    { name: 'Other', value: 3 }
  ],
  occupation: [
    { name: 'Unemployed', value: 25 },
    { name: 'Private Sector', value: 22 },
    { name: 'Self-Employed', value: 18 },
    { name: 'Student', value: 15 },
    { name: 'Government', value: 8 }
  ]
};

export const predictiveRiskData = [
  { district: 'Bengaluru Urban', currentRisk: 95, predictedRisk: 97, change: 2, confidence: 92 },
  { district: 'Mysuru', currentRisk: 72, predictedRisk: 75, change: 3, confidence: 88 },
  { district: 'Hubli-Dharwad', currentRisk: 65, predictedRisk: 64, change: -1, confidence: 85 },
  { district: 'Mangaluru', currentRisk: 58, predictedRisk: 60, change: 2, confidence: 81 },
  { district: 'Belagavi', currentRisk: 55, predictedRisk: 58, change: 3, confidence: 79 },
  { district: 'Kalaburagi', currentRisk: 52, predictedRisk: 56, change: 4, confidence: 76 },
  { district: 'Shivamogga', currentRisk: 48, predictedRisk: 45, change: -3, confidence: 75 },
  { district: 'Davangere', currentRisk: 45, predictedRisk: 46, change: 1, confidence: 72 },
  { district: 'Tumakuru', currentRisk: 42, predictedRisk: 40, change: -2, confidence: 70 },
  { district: 'Ballari', currentRisk: 40, predictedRisk: 42, change: 2, confidence: 68 }
];
