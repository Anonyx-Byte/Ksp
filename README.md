# 🔵 IRIS — Intelligence & Records Information System
### Built for the KSP Datathon | Powered by Zoho Catalyst

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Zoho Catalyst](https://img.shields.io/badge/Zoho-Catalyst-red?style=for-the-badge&logo=zoho)
![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

> **IRIS** is a real-time crime intelligence dashboard built for the Karnataka State Police. It transforms raw FIR data into actionable intelligence — from geospatial crime mapping and criminal network graphs to AI-powered case retrieval and financial fraud tracking.

---

## 🚀 Live Demo

**Dashboard:** [https://iris-dashboard-50044286164.development.catalystappsail.in](https://iris-dashboard-50044286164.development.catalystappsail.in)

**API:** [https://ksp-datathon-60079672744.development.catalystserverless.in/server/api/](https://ksp-datathon-60079672744.development.catalystserverless.in/server/api/)

---

## ✨ Features

### 📊 Command Center
The main dashboard pulls live FIR data across all Karnataka police stations and displays total cases, active investigations, cybercrime incidents, and heinous offences in real time. A live FIR feed lets officers click on any case to view full details. Zoho Zia AI automatically surfaces similar past cases by scoring keyword matches within the same crime category. Includes filters by crime type, district, and status — plus an Intelligence Alert Panel for network anomalies.

### 🗺️ Tactical Map
A geospatial map of Karnataka where officers can click on any district to see the total case count across its police stations. Features an **Optimal Patrol Route** generator that calculates the most efficient patrol path based on live crime intensity data using Leaflet.js.

### 📈 Crime Analytics & Prediction
- **Monthly Crime Trend Graphs** — tracks every crime category across Karnataka over time
- **Crime Typology** — district-wise bar chart classification of crime types
- **Predictive Risk Scores** — ranks districts by rising crime trends with AI insights on dominant crime types and under-resourced stations
- **Anomaly Detection** — flags police stations where daily FIR volume has suddenly spiked beyond expected averages
- **Demographic Insights** — age and gender breakdowns with AI analysis of socioeconomic crime drivers

### 🕸️ Criminal Network Analysis
An interactive graph (powered by Cytoscape.js) that maps every connection between suspects, victims, locations, and co-accused — all derived from real FIR data. Instantly visualise criminal syndicates, identify kingpins operating across multiple districts, and trace how criminal networks are structured.

### 🤖 Zia AI Chatbot (RAG Architecture)
A bilingual AI assistant (Kannada & English) built on **Zoho Zia Text Analytics** using a **Retrieval-Augmented Generation (RAG)** pipeline:
1. Detects Kannada input via Unicode range and translates to English (MyMemory API)
2. Sends the query to **Zoho Zia** for keyword extraction
3. Uses extracted keywords to score every FIR in the live database for relevance — matching against crime type, district, and case facts
4. Returns the top-ranked cases as a structured, grounded response
5. Translates the response back to Kannada if needed

### 💸 Financial Crime — Money Trail Analysis
Inspired by the **1930 Golden Hour Cybercrime Helpline**. Provides:
- Real-time financial fraud case reports
- Live money trail visualization — tracking how stolen funds flow from victims through layered mule bank accounts
- Flagged mule account registry with freeze status
- **Automated Pattern Alerts** — AI detects coordinated fraud patterns such as multiple complaints sharing the same IP address or sudden spikes in digital arrest cases

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS |
| Charts | Apache ECharts |
| Map | Leaflet.js |
| Network Graph | Cytoscape.js |
| Backend (Serverless) | Zoho Catalyst Advanced I/O (Node.js) |
| Frontend Hosting | Zoho Catalyst AppSail |
| AI / NLP | Zoho Zia Text Analytics |
| Translation | MyMemory Translation API |
| Database | Zoho Catalyst Data Store |

---

## 📁 Project Structure

```
iris-ksp/
├── client/                  # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Pages (map, analytics, network, financial, chat...)
│   │   ├── components/      # Reusable UI components
│   │   └── data/            # dataService.ts, chatMockResponses.ts
│   └── public/
├── functions/
│   └── api/                 # Zoho Catalyst Advanced I/O serverless backend
│       ├── index.js          # Express API routes
│       └── data/             # Bundled JSON datasets (FIRs, accused, stations...)
├── appsail-build/           # Production build for AppSail deployment
└── catalyst-config.json     # Zoho Catalyst project config
```

---

## ⚡ Running Locally

### Prerequisites
- Node.js 20+
- Zoho Catalyst CLI (`npm install -g @zohocatalyst/cli`)

### Frontend
```bash
cd client
npm install
npm run dev
```

### Backend (Catalyst Emulator)
```bash
catalyst serve
```

The frontend runs on `http://localhost:3000` and the Catalyst emulator runs the API on `http://localhost:3000/server/api`.

---

## 🚢 Deployment

```bash
# Build and deploy everything to Zoho Catalyst
powershell -ExecutionPolicy Bypass -File .\deploy_hotfix.ps1
```

This script builds the Next.js app, packages it for AppSail, and deploys both the frontend and serverless API to Zoho Catalyst in one step.

---

## 🔮 Roadmap

- [ ] Role-based access control (RBAC) with audit logs for high-profile case access
- [ ] Real-time FIR ingestion via Catalyst Event Listeners
- [ ] Push notifications for pattern alerts to field officers
- [ ] Full Zoho Catalyst Data Store migration (replacing bundled JSON)

---

## 👤 Author

**Anonyx-Byte** — Built for the KSP Datathon 2026

---

> *IRIS doesn't just store crime data. It makes it speak.*
