# 🔥 IRIS KSP — Complete Handoff Guide for Gemini

> **CRITICAL**: This document was written by Claude (the previous AI agent) as a handoff for Gemini to continue building the IRIS KSP project. Read this ENTIRE document before making ANY changes. The project is partially built — some things are real data-connected, some are hardcoded dummy data that LOOKS real, and some features are not started at all.

---

## 📍 Project Location

```
Root:       c:\Users\anony\OneDrive\Desktop\Ireuka\iris-ksp
Client:     c:\Users\anony\OneDrive\Desktop\Ireuka\iris-ksp\client
Source:     client\src\
Data:       client\src\data\
Components: client\src\components\
Pages:      client\src\app\
```

## 🏗️ Tech Stack

| What | Technology |
|---|---|
| Framework | Next.js 16.2.11 (React 19) |
| Charts | ECharts + echarts-for-react |
| Map | Leaflet |
| Network Graph | Cytoscape.js |
| Icons | Lucide React |
| PDF Export | jsPDF + html2canvas |
| CSS | CSS Modules (`.module.css`) |
| Deployment Target | Zoho Catalyst AppSail (Node 18) |

**To run locally**: `cd client && npm run dev`

---

## ⚠️ THE MOST IMPORTANT THING: DATASET SITUATION

### Current State: Dataset exists locally but NOT connected to Zoho Catalyst

The **real KSP Datathon dataset** exists as JSON files in `client/src/data/generated/` (5,000 FIRs, 12,500 accused, victims, complainants, police stations). These were converted from the actual KSP data by Python scripts (`gen_firs.py`, `gen_persons.py` in `c:\Users\anony\OneDrive\Desktop\Ireuka\`).

### ❗ THE ACTUAL PROBLEM: DATASET MUST BE UPLOADED TO ZOHO CATALYST

The dataset needs to be **uploaded to Zoho Catalyst Data Store** (Catalyst's cloud database service). Then the app must **connect to Catalyst Data Store via API** to fetch data. Here's the status:

| What | Current State | What Needs to Happen |
|---|---|---|
| Dataset location | Local JSON files in `src/data/generated/` | Upload to **Catalyst Data Store** tables |
| Dashboard & Analytics | Read from local `dataService.ts` (works but reads local files) | Switch to Catalyst Data Store API calls |
| Financial page | Has own hardcoded dummy data (`financialData.ts`) | Connect to Catalyst Data Store |
| Network page | Has own hardcoded dummy data (`networkData.ts`) | Connect to Catalyst Data Store |
| Chat page | Has own hardcoded mock responses (`chatMockResponses.ts`) | Connect to Catalyst Zia AI + Data Store |
| Map page | Has own hardcoded data (`karnatakaDistricts.ts`, `policeStations.ts`) | Connect to Catalyst Data Store |

### The Integration Steps:
1. **Create tables in Catalyst Data Store** matching the dataset schema (FIRs, Accused, Victims, Complainants, PoliceStations)
2. **Upload the JSON data** to those Catalyst Data Store tables (via Catalyst SDK or console)
3. **Create Catalyst Functions** (serverless backend) that query the Data Store and return data
4. **Update `dataService.ts`** to call those Catalyst Functions via API instead of reading local JSON
5. **Connect Financial, Network, Chat, Map pages** to the same Catalyst backend
6. **Connect Chat to Catalyst Zia** for AI-powered natural language queries

> The hardcoded data files (`financialData.ts`, `networkData.ts`, etc.) are **UI mockups** showing what the final connected version should look like. They should be replaced with real Catalyst API calls.

### ⚠️ LEGACY DUMMY DATA FILES (Still in codebase, some still imported!)

These files exist in `client/src/data/` alongside `dataService.ts` and contain HARDCODED dummy data. Some components STILL import from these instead of `dataService.ts`:

| File | What It Contains | Still Used? |
|---|---|---|
| `analyticsData.ts` | Legacy crime trends, district risk, typology, anomaly, demographic, predictive data | ❌ Unused (replaced by dataService) |
| `chatMockResponses.ts` | Keyword-matched mock AI responses | ✅ Used by ChatBot.tsx |
| `crimeHeatmapData.ts` | Procedural lat/lng clustering for heatmap | ❌ Unused |
| `financialData.ts` | Hardcoded golden hour, Sankey, mule accounts, pattern alerts | ✅ Used by ALL financial components |
| `karnatakaDistricts.ts` | Hardcoded district metadata (case counts, risk levels) | ✅ Used by TacticalMap.tsx |
| `mockData.ts` | Dashboard KPI fallback, recent FIRs, alerts | ❌ Unused (replaced by dataService) |
| `networkData.ts` | Hardcoded criminal network graph (19 nodes, 24 edges) | ✅ Used by NetworkGraph.tsx |
| `policeStations.ts` | 50 hardcoded stations with cases/officers | ✅ Used by TacticalMap.tsx |

> **IMPORTANT**: When connecting real data, you need to update `TacticalMap.tsx` to use `dataService.ts` instead of `karnatakaDistricts.ts` and `policeStations.ts`!

### Generated Data Files (in `client/src/data/generated/`)

| File | Size | Records | Description |
|---|---|---|---|
| `fir_records.json` | 2.5 MB | ~5,000 FIRs | Crime number, date, station ID, lat/lng, crime type, BriefFacts |
| `accused_records.json` | 2.0 MB | ~12,500 accused | Name, age, gender, linked CaseMasterID |
| `complainant_records.json` | 1.0 MB | ~5,000 complainants | Name, age, gender |
| `victim_records.json` | 1.7 MB | ~5,000 victims | Name, age, gender |
| `police_stations.json` | 39 KB | 31 districts, ~250 stations | District hierarchy with lat/lng |

### Schema of Generated Data

```typescript
// FIR Record
{
  CaseMasterID: number,        // Unique case ID (1-5000)
  CrimeNo: string,             // "CRN-XXXX-YYYY"
  CaseNo: string,              // "FIR-XXXX-YYYY"
  CrimeRegisteredDate: string, // "YYYY-MM-DD"
  PoliceStationID: number,     // Links to police_stations.json
  latitude: number,            // Random around station location
  longitude: number,
  CaseCategoryID: number,      // 1=Cognizable, 2=Non-Cognizable
  GravityOffenceID: number,    // 1=Heinous, 2=Non-Heinous
  CaseStatusID: number,        // 1=Under Investigation, 2=Charge Sheeted, 3=Closed, 4=Active
  CrimeType: string,           // "Cybercrime", "Theft", "Assault", etc.
  BriefFacts: string           // AI-generated paragraph describing the crime
}

// Accused Record
{
  AccusedMasterID: number,
  CaseMasterID: number,        // Links to FIR
  AccusedName: string,
  AgeYear: number,
  GenderID: string,            // "M" or "F"
  PersonID: string             // "P-XXXXX"
}
```

### Data Service: `client/src/data/dataService.ts`

This is the **central data hub**. Dashboard and Analytics use it correctly. Financial, Network, Chat, and Map need to be migrated to use it too. It provides:

| Function | What It Does | Used By |
|---|---|---|
| `getKPIStats()` | Total FIRs, active, cyber, heinous counts | Dashboard |
| `getCrimeTypeCounts()` | Crime type → count map | Analytics (Typology Bar) |
| `getDistrictCrimeCounts()` | Per-district stats with top crime | Analytics (District Table) |
| `getRecentFIRs(filters?)` | Filtered, sorted FIR list | Dashboard (FIR feed) |
| `getMonthlyCrimeTrends()` | Month-by-month breakdown | Analytics (Trend Chart) |
| `getRepeatOffenders()` | Accused appearing in 2+ FIRs | Dashboard (Alerts) |
| `getAccusedDemographics(district?)` | Age/gender breakdown | Analytics (Demographics) |
| `getAllDistricts()` | District name list | Dropdowns everywhere |
| `getAllCrimeTypes()` | Crime type list | Dropdowns everywhere |

---

## 📊 PAGE-BY-PAGE STATUS

### 1. Dashboard (`/`) — `src/app/page.tsx`
**Status: ✅ MOSTLY WORKING (data-connected)**

| Feature | Status | Data Source |
|---|---|---|
| KPI Cards (Total FIRs, Active, Cyber, Heinous) | ✅ Real | `getKPIStats()` |
| Recent FIR Feed with filters | ✅ Real | `getRecentFIRs()` |
| Repeat Offender Alerts | ✅ Real | `getRepeatOffenders()` |
| Mini Map Preview | ❌ Shows "Map Integration Pending" | Needs mini TacticalMap |
| "Investigate" / "View All" buttons | ❌ Non-functional | Need click handlers |

### 2. Analytics (`/analytics`) — `src/app/analytics/page.tsx`
**Status: ✅ MOSTLY WORKING (data-connected)**

| Component | Status | Data Source | Notes |
|---|---|---|---|
| District Intelligence Table | ✅ Real | `getDistrictCrimeCounts()` | Sortable, expandable rows |
| Crime Typology Bar Chart | ✅ Real | `getCrimeTypeCounts()` | With district/station filter |
| Crime Trend Chart | ✅ Real | `getMonthlyCrimeTrends()` | Time slider, multi-line |
| Anomaly Detection Cards | ⚠️ PARTIALLY REAL | Computed from data BUT some hardcoded thresholds | Needs better anomaly algorithm |
| Predictive Risk Table | ⚠️ PARTIALLY REAL | Uses district data BUT prediction is simple weighted average | Only shows top districts, expansion is buggy |
| Demographic Charts | ✅ Real | `getAccusedDemographics()` | Age/gender with district filter |

**Known Issues:**
- Predictive Risk: Only top 10 districts visible (should show ALL 31)
- Predictive Risk: When clicking a district to expand, the expansion is janky — police station bars cramp up and get hidden behind the anomaly section
- Anomaly Detection: Needs more actionable insights, not just alerts
- Layout: Full-width stacked vertical panels (user preference)

### 3. Chat (`/chat`) — `src/app/chat/page.tsx`
**Status: ❌ FULLY HARDCODED MOCK DATA**

The chat uses `chatMockResponses.ts` which is a keyword-matching mock system. It does NOT connect to any AI/LLM backend.

**How it works now:**
- User types a query
- `getMockResponse(query)` does keyword matching (e.g., if query contains "cybercrime" AND "bengaluru" → return hardcoded table)
- Shows fake SQL query as if it generated it
- ~10 hardcoded response templates

**What it needs:**
- Connect to **Zoho Catalyst Zia** (their AI service) OR a custom backend
- Real NLP that queries the actual dataset
- OR at minimum, replace mock responses with REAL data from `dataService.ts` functions based on keywords

### 4. Financial (`/financial`) — `src/app/financial/page.tsx`
**Status: ❌ 100% HARDCODED DUMMY DATA**

ALL four sub-components use hardcoded data:

| Component | File | What's Hardcoded |
|---|---|---|
| `GoldenHourPanel` | `components/financial/GoldenHourPanel.tsx` | Fake countdown timer, fake bank names, fake amounts |
| `MoneyTrailSankey` | `components/financial/MoneyTrailSankey.tsx` | Hardcoded Sankey diagram nodes/links |
| `MuleAccountTable` | `components/financial/MuleAccountTable.tsx` | Fake mule account alerts with fake bank details |
| `PatternAlerts` | `components/financial/PatternAlerts.tsx` | Hardcoded fraud pattern alerts |

**What it needs:**
- Filter FIRs where `CrimeType === 'Financial Fraud'` or `'Cybercrime'`
- Extract transaction amounts from `BriefFacts` text (the AI-generated descriptions mention amounts)
- Multi-case selector dropdown at top to pick a specific FIR
- Golden hour timer calculated from `CrimeRegisteredDate`

### 5. Network (`/network`) — `src/app/network/page.tsx`
**Status: ❌ 100% HARDCODED DUMMY DATA**

| Component | File | What's Hardcoded |
|---|---|---|
| `NetworkGraph` | `components/network/NetworkGraph.tsx` | Fake nodes (N-001, N-002) with fake connections |
| `NodeDetailPanel` | `components/network/NodeDetailPanel.tsx` | Fake detail panel data |

**What it needs — FIR-Based Auto-Linking:**
1. Parse ALL accused records
2. Find accused names that appear in 2+ different FIRs
3. Group them into networks (shared accused = connected)
4. Each network gets an ID (N-001, N-002...)
5. Build Cytoscape graph from real connections
6. `dataService.ts` already has `getRepeatOffenders()` which does step 1-3 — extend it!

### 6. Map (`/map`) — `src/app/map/page.tsx`
**Status: ⚠️ PARTIALLY WORKING (uses mix of real + hardcoded data)**

| Feature | Status | Notes |
|---|---|---|
| Karnataka district boundaries (GeoJSON) | ✅ Working | Leaflet + GeoJSON overlay |
| District coloring by crime density | ⚠️ HARDCODED | Uses `karnatakaDistricts.ts` NOT dataService |
| Police station markers | ⚠️ HARDCODED | Uses `policeStations.ts` (50 hardcoded stations) |
| Click district → shows stats popup | ✅ Working | But stats come from hardcoded data |
| Crime filter pills (top) | ❌ NON-FUNCTIONAL | UI toggles but does NOT filter map data |
| Patrol Route Optimizer | ❌ NOT STARTED | Should show heatmap of high-crime zones by time-of-day |

> **FIX NEEDED**: `TacticalMap.tsx` imports from `karnatakaDistricts.ts` and `policeStations.ts` (hardcoded). It should import from `dataService.ts` instead.

**Important**: The GeoJSON file was renamed from `.geojson` to `.json` for Catalyst compatibility. The fetch path in `TacticalMap.tsx` line 95 references `/data/karnataka_districts.json`.

### 7. Settings (`/settings`) — `src/app/settings/page.tsx`
**Status: ❌ BARE PLACEHOLDER**

Just shows text: "User preferences and system configuration pending..." — no forms, no toggles, nothing.

### 8. Topbar — `src/components/layout/Topbar.tsx`
**Status: ⚠️ HARDCODED USER PROFILE**

- Displays hardcoded name: **"Insp. Naveen"** and **"CCB Bengaluru"**
- Search input is non-functional
- Notification bell is non-functional
- This should show the LOGGED IN officer's name/rank after auth is implemented

### Unused Components (can be deleted)
- `src/components/charts/AnomalyChart.tsx` — Old anomaly chart, replaced by `AnomalyCards.tsx`
- `src/components/charts/CrimeTypologyChart.tsx` — Old typology, replaced by `CrimeTypologyBar.tsx`

---

## 🔐 LOGIN / AUTH SYSTEM — NOT IMPLEMENTED

There is **NO login system** currently. No auth, no role-based access. The app is fully open.

### What the user wants:

1. **Login page** — Officer enters credentials
2. **Role-based access control:**
   - **SP (Superintendent)** — Can see ALL districts, ALL features
   - **DSP (Deputy SP)** — Can see their assigned district(s) only
   - **Inspector** — Can see their police station only
   - **Constable** — Read-only dashboard access
3. **Zoho Catalyst Authentication** — Catalyst has built-in auth. Read: https://docs.catalyst.zoho.com/en/sdk/web/authentication/
4. The sidebar and data should filter based on the logged-in officer's jurisdiction

### Implementation approach:
- Use Catalyst's built-in Authentication SDK
- After login, store officer role + jurisdiction in session
- Wrap the app layout in an auth check
- Pass jurisdiction filter down to all data functions

---

## 🚀 DEPLOYMENT STATUS

### Current situation:
- **Catalyst AppSail** service `iris-dashboard` was created via Console
- The standalone zip was uploaded BUT crashes with `Cannot find module 'next'`
- Root cause: PowerShell's `Compress-Archive` used Windows backslashes in zip paths, which Linux couldn't parse
- A Python script was used to create `iris-standalone.zip` with forward slashes — **this fixed zip has NOT been successfully deployed yet**

### How to deploy (AppSail via Console):

1. Build locally: `cd client && npm run build` (with `output: "standalone"` in `next.config.ts`)
2. Create deploy package:
   ```
   - Copy .next/standalone/* to deploy-pkg/
   - Copy public/* to deploy-pkg/public/
   - Copy .next/static/* to deploy-pkg/.next/static/
   ```
3. Zip with **forward slashes** (use Python, NOT PowerShell Compress-Archive):
   ```python
   import zipfile, os
   with zipfile.ZipFile('iris-standalone.zip', 'w', zipfile.ZIP_DEFLATED) as z:
       for root, dirs, files in os.walk('deploy-pkg'):
           for f in files:
               fp = os.path.join(root, f)
               z.write(fp, os.path.relpath(fp, 'deploy-pkg').replace('\\', '/'))
   ```
4. Upload to Catalyst Console → AppSail → iris-dashboard → Create Deployment
5. **Startup command**: `node server.js`
6. **Build command**: Leave blank (pre-built)
7. The `server.js` already reads `X_ZOHO_CATALYST_LISTEN_PORT` (Catalyst's port env var)

### Important files for deployment:
- `client/next.config.ts` — Must have `output: "standalone"` for AppSail
- `client/app-config.json` — Catalyst AppSail config
- `catalyst.json` — Root Catalyst project config
- `deploy-pkg/server.js` — Modified to read `X_ZOHO_CATALYST_LISTEN_PORT`

---

## 📋 REMAINING FEATURES (PRIORITY ORDER)

### P0 — Must Have

#### 1. Upload Dataset to Zoho Catalyst Data Store & Connect App
- Create tables in Catalyst Data Store matching the schema (CaseMaster, AccusedMaster, VictimMaster, ComplainantMaster, PoliceStations)
- Upload the JSON data from `generated/*.json` to those tables
- Create Catalyst Functions (serverless) to query the Data Store
- Update `dataService.ts` to call Catalyst Functions via API instead of reading local JSON
- Connect ALL pages (Financial, Network, Chat, Map) to the same Catalyst backend
- Connect Chat to Catalyst Zia for AI-powered queries
- Docs: https://docs.catalyst.zoho.com/en/cloud-scale/data-store/
- This is THE most important task — everything must read from Catalyst

#### 2. Fix Predictive Risk Table
- Show ALL 31 districts (not just top 10)
- Fix expansion animation — currently bars cramp and hide behind anomaly section
- Add more detailed insights per district when expanded
- File: `components/charts/PredictiveRiskChart.tsx`

#### 3. Fix Login/Auth System
- Add Catalyst Authentication
- Create login page at `/login`
- Add auth wrapper to `layout.tsx`
- Role-based data filtering

### P1 — Important

#### 4. Network FIR Auto-Linking
- Extend `getRepeatOffenders()` in `dataService.ts` to build network graph data
- Replace hardcoded Cytoscape data in `NetworkGraph.tsx`
- Group accused into networks, generate N-XXX IDs
- File: `components/network/NetworkGraph.tsx`

#### 5. Financial Page — Connect to Data
- Filter FIRs by financial crime types
- Replace hardcoded Sankey/mule data with real extracted data
- Add multi-case selector dropdown
- Files: All 4 components in `components/financial/`

#### 6. Chat — Replace Mock with Real Data Queries
- At minimum: replace `chatMockResponses.ts` keyword matching with actual `dataService.ts` function calls
- Better: Connect to Catalyst Zia for NLP
- File: `components/chat/ChatBot.tsx` and `data/chatMockResponses.ts`

#### 7. Patrol Route Optimizer
- Add crime density heatmap overlay on map
- Show high-risk zones by time-of-day
- Toggle in map controls
- File: `components/map/TacticalMap.tsx`

### P2 — Nice to Have

#### 8. Similar Past Case Matcher
- When viewing an FIR, find past FIRs with same crime type + nearby location
- Show resolution time and outcome

#### 9. Non-functional Button Wiring
- "Investigate", "View All", "Assign Team" buttons do nothing
- Wire them to navigation or modals

#### 10. Demographic AI Pattern Insights
- Analyze BriefFacts text to identify root causes
- Would need Zia or a simple keyword extraction

---

## 🗂️ FILE REFERENCE

### Key Source Files

| File | Purpose |
|---|---|
| `src/data/dataService.ts` | **Central data hub** — ALL data functions |
| `src/data/chatMockResponses.ts` | Mock AI chat responses (REPLACE THIS) |
| `src/data/karnatakaDistricts.ts` | District metadata for map |
| `src/data/generated/*.json` | The REAL KSP dataset files (upload these to Catalyst Data Store) |
| `src/app/layout.tsx` | Root layout with sidebar + topbar |
| `src/app/page.tsx` | Dashboard page |
| `src/app/analytics/page.tsx` | Analytics page |
| `src/app/chat/page.tsx` | Chat page |
| `src/app/financial/page.tsx` | Financial crime page |
| `src/app/network/page.tsx` | Network analysis page |
| `src/app/map/page.tsx` | Tactical map page |
| `src/app/settings/page.tsx` | Settings page |
| `src/components/map/TacticalMap.tsx` | Leaflet map component |
| `src/components/charts/*.tsx` | All chart components |
| `src/components/financial/*.tsx` | Financial sub-components (ALL DUMMY) |
| `src/components/network/*.tsx` | Network graph (ALL DUMMY) |
| `src/components/chat/ChatBot.tsx` | Chat interface (MOCK RESPONSES) |
| `src/components/layout/Sidebar.tsx` | Navigation sidebar |
| `src/components/layout/Topbar.tsx` | Top navigation bar |
| `src/components/layout/PageBanner.tsx` | Page header banners |
| `public/data/karnataka_districts.json` | GeoJSON district boundaries |
| `public/images/` | Banner images |

### Config Files

| File | Purpose |
|---|---|
| `client/next.config.ts` | Currently: `output: "standalone"` |
| `client/app-config.json` | Catalyst AppSail config |
| `catalyst.json` | Root Catalyst project mapping |
| `client/package.json` | Dependencies |

---

## 🎨 DESIGN RULES (USER PREFERENCES)

1. **Color theme**: Deep emerald greens (#0a1a15) with warm sandstone/terracotta accents (#c47a4a)
2. **Layout**: Full-width, vertical stacked panels — NO dense grids
3. **Map style**: Dark sci-fi tactical theme
4. **Typography**: JetBrains Mono (headings), system fonts (body)
5. **NO generic colors** — Use the emerald/sandstone palette consistently
6. **Breathable spacing** — User hates cramped layouts
7. **Banners**: Each page has a Karnataka landmark banner (Vidhana Soudha, Hampi, Mysuru Palace, etc.)

---

## 🧠 TIPS FOR GEMINI

1. **Don't rebuild what works** — Dashboard, Analytics (mostly), and Map are working. Focus on Financial, Network, Chat, and Auth.

2. **dataService.ts is your friend** — All data goes through here. Add new functions here, import them in components.

3. **The generated JSON IS real KSP data** — The files in `generated/*.json` contain actual Karnataka police FIR records converted from the KSP Datathon dataset. The user may want to scale to 18K FIRs later but for now, use these 5K records.

4. **Don't break the build** — Run `npm run build` before deploying. The app should build with 0 errors.

5. **Catalyst deployment is tricky** — Use the Python zip script, NOT PowerShell's `Compress-Archive`. Windows backslashes break Linux.

6. **The user gets frustrated with half-done features** — If you build something, build it COMPLETELY with real data connections, not just UI shells.

7. **Test locally first** — `npm run dev` starts at localhost:3000. Test every change before deploying.

---

## 📞 QUICK START CHECKLIST

```
1. [ ] Read this ENTIRE document
2. [ ] Run: cd c:\Users\anony\OneDrive\Desktop\Ireuka\iris-ksp\client && npm run dev
3. [ ] Open localhost:3000 — click through every page
4. [ ] Check what the user wants to do first (deploy? fix features? connect data?)
5. [ ] Follow the priority order above
```

---

*Written by Claude on July 25, 2026. Good luck, Gemini! 🫡*
