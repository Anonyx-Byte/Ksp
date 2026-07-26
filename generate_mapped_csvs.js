const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..'); // Ireuka folder
const outPath = path.join(__dirname, 'dataset_csv_mapped');

if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath);
}

// Helper to escape CSV strings
const escapeCSV = (str) => {
    if (str === null || str === undefined) return '';
    const s = String(str);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
};

// 1. FIR_Records (CaseMaster)
const firRaw = JSON.parse(fs.readFileSync(path.join(dataPath, 'fir_records.json'), 'utf-8'));
let firCsv = 'CaseMasterID,CrimeNo,CaseNo,CrimeRegisteredDate,PolicePersonID,PoliceStationID,CaseCategoryID,GravityOffenceID,CrimeMajorHeadID,CrimeMinorHeadID,CaseStatusID,CourtID,IncidentFromDate,IncidentToDate,InfoReceivedPSDate,latitude,longitude,BriefFacts\n';
firRaw.forEach(f => {
    firCsv += `${f.CaseMasterID},${escapeCSV(f.CrimeNo)},${escapeCSV(f.CaseNo)},${escapeCSV(f.CrimeRegisteredDate)},${f.PolicePersonID},${f.PoliceStationID},${f.CaseCategoryID},${f.GravityOffenceID},${f.CrimeMajorHeadID},${f.CrimeMinorHeadID},${f.CaseStatusID},${f.CourtID},${escapeCSV(f.IncidentFromDate)},${escapeCSV(f.IncidentToDate)},${escapeCSV(f.InfoReceivedPSDate)},${f.latitude},${f.longitude},${escapeCSV(f.BriefFacts)}\n`;
});
fs.writeFileSync(path.join(outPath, 'CaseMaster.csv'), firCsv);

// 2. Complainant_Records
const compRaw = JSON.parse(fs.readFileSync(path.join(dataPath, 'complainant_records.json'), 'utf-8'));
let compCsv = 'ComplainantID,CaseMasterID,ComplainantName,AgeYear,OccupationID,ReligionID,CasteID,GenderID\n';
compRaw.forEach(c => {
    compCsv += `${c.ComplainantID},${c.CaseMasterID},${escapeCSV(c.ComplainantName)},${c.AgeYear},${c.OccupationID},${c.ReligionID},${c.CasteID},${escapeCSV(c.GenderID)}\n`;
});
fs.writeFileSync(path.join(outPath, 'ComplainantDetails.csv'), compCsv);

// 3. Accused_Records
const accRaw = JSON.parse(fs.readFileSync(path.join(dataPath, 'accused_records.json'), 'utf-8'));
let accCsv = 'AccusedMasterID,CaseMasterID,AccusedName,AgeYear,GenderID,PersonID\n';
accRaw.forEach(a => {
    accCsv += `${a.AccusedMasterID},${a.CaseMasterID},${escapeCSV(a.AccusedName)},${a.AgeYear},${escapeCSV(a.GenderID)},${escapeCSV(a.PersonID)}\n`;
});
fs.writeFileSync(path.join(outPath, 'Accused.csv'), accCsv);

// 4. Victim_Records
const vicRaw = JSON.parse(fs.readFileSync(path.join(dataPath, 'victim_records.json'), 'utf-8'));
let vicCsv = 'VictimMasterID,CaseMasterID,VictimName,AgeYear,GenderID,VictimPolice\n';
vicRaw.forEach(v => {
    vicCsv += `${v.VictimMasterID},${v.CaseMasterID},${escapeCSV(v.VictimName)},${v.AgeYear},${escapeCSV(v.GenderID)},${escapeCSV(v.VictimPolice)}\n`;
});
fs.writeFileSync(path.join(outPath, 'Victim.csv'), vicCsv);

// 5. ArrestSurrender
const arrRaw = JSON.parse(fs.readFileSync(path.join(dataPath, 'arrest_surrender.json'), 'utf-8'));
let arrCsv = 'ArrestSurrenderID,CaseMasterID,ArrestSurrenderTypeID,ArrestSurrenderDate,ArrestSurrenderStateId,ArrestSurrenderDistrictId,PoliceStationID,IOID,CourtID,AccusedMasterID,IsAccused,IsComplainantAccused\n';
arrRaw.forEach(a => {
    arrCsv += `${a.ArrestSurrenderID},${a.CaseMasterID},${a.ArrestSurrenderTypeID},${escapeCSV(a.ArrestSurrenderDate)},${a.ArrestSurrenderStateId},${a.ArrestSurrenderDistrictId},${a.PoliceStationID},${a.IOID},${a.CourtID},${a.AccusedMasterID},${a.IsAccused},${a.IsComplainantAccused}\n`;
});
fs.writeFileSync(path.join(outPath, 'ArrestSurrender.csv'), arrCsv);

console.log('CSVs generated successfully in dataset_csv_mapped folder.');
