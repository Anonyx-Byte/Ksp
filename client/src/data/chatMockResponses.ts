/**
 * chatMockResponses.ts — AI chat mock response generator for Project IRIS
 * Keyword-matched responses simulating an NLP-powered crime intelligence chatbot.
 */

import { getFirRecords, getRepeatOffenders, getStationName, getDistrictForStation } from './dataService';

export interface ChatResponse {
  text: string;
  data?: {
    type: 'table' | 'stats' | 'list';
    content: any;
  };
  query?: string;
  suggestions?: string[];
}

/**
 * Returns an AI response by querying the local dataset in dataService.
 */
export async function getAIResponse(query: string): Promise<ChatResponse> {
  // 1. Detect Kannada and Translate to English
  const isKannada = /[\u0C80-\u0CFF]/.test(query);
  let processedQuery = query;

  if (isKannada) {
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=kn|en`);
      const data = await res.json();
      if (data.responseData && data.responseData.translatedText) {
        processedQuery = data.responseData.translatedText;
      }
    } catch (e) {
      console.error("Translation to English failed", e);
    }
  }

  const q = processedQuery.toLowerCase();

  // 2. Extract Keywords using Catalyst Zia (or fallback)
  let keywords: string[] = [];
  try {
     const res = await fetch('http://localhost:3000/server/api/zia/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: processedQuery })
     });
     if (res.ok) {
         const ziaData = await res.json();
         if (ziaData && ziaData.length > 0 && ziaData[0].keyword_extraction) {
             keywords = ziaData[0].keyword_extraction.map((k: any) => k.keyword.toLowerCase());
         }
     }
  } catch (e) {
     console.error("Zia fetch failed", e);
  }

  // Fallback to basic splitting if Zia fails or returns empty
  if (keywords.length === 0) {
    keywords = q.split(' ').filter(w => w.length > 3);
  }
  const hasKeyword = (word: string) => keywords.includes(word) || q.includes(word);

  const allFirs = getFirRecords();
  let aiResponseText = '';
  let responseData: any = undefined;
  let sqlQuery = '';

  // 3. Check for specific analytical requests first
  if (hasKeyword('cybercrime') && (hasKeyword('bengaluru') || hasKeyword('bangalore'))) {
    const cyberFirs = allFirs.filter(f => f.CrimeType === 'Cybercrime' || f.CrimeType === 'Financial Fraud');
    const blrFirs = cyberFirs.filter(f => getDistrictForStation(f.PoliceStationID).toLowerCase().includes('bengaluru'));
    
    const monthCounts: Record<string, number> = {};
    blrFirs.forEach(f => {
      const month = f.CrimeRegisteredDate.substring(0, 7);
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    
    const rows = Object.entries(monthCounts).sort((a, b) => a[0].localeCompare(b[0])).map(([month, count]) => {
      const phishing = Math.floor(count * 0.3);
      const idTheft = Math.floor(count * 0.1);
      return [month, phishing, idTheft, count - phishing - idTheft, count];
    });

    const displayedRows = rows.slice(-6);
    aiResponseText = `Based on the latest FIR dataset, here are the cybercrime statistics for Bengaluru over the recent months. We see a total of ${displayedRows.reduce((sum, row) => sum + (row[4] as number), 0)} cases in this period.`;
    responseData = { type: 'table', content: { headers: ['Month', 'Phishing', 'Identity Theft', 'Financial Fraud', 'Total'], rows: displayedRows } };
    sqlQuery = `SELECT MONTH(CrimeRegisteredDate) AS Month, COUNT(*) as Total FROM FIR_Records WHERE CrimeType='Cybercrime' AND PoliceStationID IN (SELECT UnitID FROM Police_Stations WHERE DistrictName LIKE '%Bengaluru%') GROUP BY Month;`;
  } 
  else if (hasKeyword('hotspot') || hasKeyword('hotspots') || hasKeyword('financial fraud')) {
    const financialFirs = allFirs.filter(f => f.CrimeType === 'Financial Fraud' || f.CrimeType === 'Cybercrime');
    const districtCounts: Record<string, number> = {};
    financialFirs.forEach(f => {
      const district = getDistrictForStation(f.PoliceStationID) || 'Unknown';
      districtCounts[district] = (districtCounts[district] || 0) + 1;
    });
    const sorted = Object.entries(districtCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    aiResponseText = `I have analyzed the database for financial fraud hotspots. The districts with the highest case volumes are:`;
    responseData = { type: 'table', content: { headers: ['District', 'Total Cases', 'Risk Level'], rows: sorted.map(([dist, count]) => [dist, count, count > 300 ? 'Critical' : 'High']) } };
    sqlQuery = `SELECT DistrictName, COUNT(*) as TotalCases FROM FIR_Records JOIN Police_Stations ON FIR_Records.PoliceStationID = Police_Stations.UnitID WHERE CrimeType='Financial Fraud' GROUP BY DistrictName ORDER BY TotalCases DESC LIMIT 5;`;
  }
  else if (hasKeyword('repeat') || hasKeyword('offender') || hasKeyword('offenders')) {
    const offenders = getRepeatOffenders().slice(0, 5);
    if (offenders.length === 0) {
      aiResponseText = `I couldn't find any repeat offenders in your authorized jurisdiction based on the current database records.`;
      responseData = undefined;
    } else {
      aiResponseText = `Here are the top repeat offenders extracted from our suspect database across multiple FIRs:`;
      responseData = { 
        type: 'list', 
        content: offenders.map(o => ({
          name: o.name,
          cases: o.caseIds.length,
          type: o.crimeTypes.join(', '),
          district: o.districts.join(', '),
          risk: o.caseIds.length > 5 ? 'Critical' : 'High'
        })) 
      };
    }
    sqlQuery = `SELECT AccusedName, COUNT(DISTINCT CaseMasterID) as LinkedCases FROM Accused_Records GROUP BY AccusedName HAVING LinkedCases > 1 ORDER BY LinkedCases DESC LIMIT 5;`;
  }
  else {
    // 4. Live RAG Keyword Search Fallback
    const searchResults = allFirs.map(fir => {
      let score = 0;
      const brief = (fir.BriefFacts || '').toLowerCase();
      const type = (fir.CrimeType || '').toLowerCase();
      const district = (getDistrictForStation(fir.PoliceStationID) || '').toLowerCase();
      
      keywords.forEach(kw => {
        if (brief.includes(kw)) score += 2;
        if (type.includes(kw)) score += 3;
        if (district.includes(kw)) score += 3;
        if (q.includes(String(fir.CaseMasterID))) score += 10;
        if (fir.CrimeNo && q.includes(fir.CrimeNo.toLowerCase())) score += 10;
      });
      
      return { fir, score };
    }).filter(res => res.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);

    if (searchResults.length > 0) {
      aiResponseText = `I found ${searchResults.length} relevant case(s) matching your query:\n\n`;
      responseData = {
        type: 'table',
        content: {
          headers: ['FIR No', 'Type', 'District', 'Brief'],
          rows: searchResults.map(res => [
            res.fir.CrimeNo || `FIR-${res.fir.CaseMasterID}`,
            res.fir.CrimeType,
            getDistrictForStation(res.fir.PoliceStationID),
            res.fir.BriefFacts.substring(0, 100) + '...'
          ])
        }
      };
      sqlQuery = `SELECT CrimeNo, CrimeType, PoliceStationID, BriefFacts FROM FIR_Records WHERE MATCH(BriefFacts) AGAINST ('${keywords.join(' ')}') LIMIT 5;`;
    } else {
      aiResponseText = "I couldn't find any specific cases or trends matching your query in the database. Please try providing more keywords or an FIR number.";
      sqlQuery = `SELECT * FROM FIR_Records WHERE BriefFacts LIKE '%${q.substring(0, 20)}%' LIMIT 5;`;
    }
  }

  // 5. Translate Response back to Kannada if needed
  if (isKannada && aiResponseText) {
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(aiResponseText)}&langpair=en|kn`);
      const data = await res.json();
      if (data.responseData && data.responseData.translatedText) {
        aiResponseText = data.responseData.translatedText;
      }
    } catch (e) {
      console.error("Translation back to Kannada failed", e);
    }
  }

  return {
    text: aiResponseText,
    data: responseData,
    query: sqlQuery,
    suggestions: [
      'Show cybercrime trends in Bengaluru',
      'Who are the repeat offenders?',
      'Find financial fraud hotspots'
    ],
  };
}
