const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize catalyst app
app.use((req, res, next) => {
    req.catalystApp = catalyst.initialize(req, { type: catalyst.type.AdvancedIO });
    next();
});

// Helper function to fetch all records from a table, handling pagination
async function fetchAllRecords(catalystApp, tableName) {
    let allRecords = [];
    let nextToken = undefined;
    const table = catalystApp.datastore().table(tableName);
    
    do {
        // Fetch rows 200 at a time
        const response = await table.getPagedRows({ nextToken });
        
        if (response && response.data) {
            // Extract the actual column data from the Catalyst response format
            const extracted = response.data.map(row => row[tableName]);
            allRecords = allRecords.concat(extracted);
        }
        
        nextToken = response ? response.next_token : undefined;
    } while (nextToken);
    
    return allRecords;
}

app.get('/test', async (req, res) => {
    res.status(200).send({ status: 'ok', message: 'Catalyst API is running' });
});

const fs = require('fs');
const path = require('path');



// Generic endpoint to fetch all data for a specific table
app.get('/table/:tableName', async (req, res) => {
    try {
        console.log(`Requested table: ${req.params.tableName}`);
        const tableName = req.params.tableName;
        const basePath = path.join(__dirname, 'data');
        let data = [];

        // In Catalyst emulator, table creation is manual. To give the user a working deployed app
        // without manual Zoho console setup, we bundle the dataset into the deployment.
        if (tableName === 'Police_Stations') {
            const fileContent = fs.readFileSync(path.join(basePath, 'police_stations.json'), 'utf-8');
            const raw = JSON.parse(fileContent);
            raw.forEach(d => {
                d.police_stations.forEach(ps => {
                    data.push({
                        UnitID: ps.UnitID, UnitName: ps.UnitName, DistrictID: d.DistrictID,
                        DistrictName: d.DistrictName, latitude: ps.latitude, longitude: ps.longitude,
                        population: d.population
                    });
                });
            });
        } else if (tableName === 'CaseMaster' || tableName === 'FIR_Records') {
            data = JSON.parse(fs.readFileSync(path.join(basePath, 'fir_records.json'), 'utf-8'));
        } else if (tableName === 'Accused' || tableName === 'Accused_Records') {
            data = JSON.parse(fs.readFileSync(path.join(basePath, 'accused_records.json'), 'utf-8'));
        } else if (tableName === 'ComplainantDetails' || tableName === 'Complainant_Records') {
            data = JSON.parse(fs.readFileSync(path.join(basePath, 'complainant_records.json'), 'utf-8'));
        } else if (tableName === 'Victim' || tableName === 'Victim_Records') {
            data = JSON.parse(fs.readFileSync(path.join(basePath, 'victim_records.json'), 'utf-8'));
        } else if (tableName === 'ArrestSurrender') {
            data = JSON.parse(fs.readFileSync(path.join(basePath, 'arrest_surrender.json'), 'utf-8'));
        } else {
            console.log(`Table ${tableName} not found in mock`);
            return res.status(404).json({ error: 'Table not found in mock datastore' });
        }
        
        console.log(`Sending response for ${tableName} with ${data.length} records`);
        res.status(200).json(data);
    } catch (err) {
        console.error(`Error fetching table ${req.params.tableName}:`, err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// Zia Text Analytics Endpoint
app.post('/zia/analyze', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "Missing 'text' in request body." });
        }
        
        const zia = req.catalystApp.zia();
        const content = await zia.getTextAnalytics([text]);
        
        res.status(200).json(content);
    } catch (err) {
        console.error('Error in Zia text analytics:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// Get schema
app.get('/schema/:tableName', async (req, res) => {
    try {
        const tableName = req.params.tableName;
        const schema = await req.catalystApp.datastore().table(tableName).getColumnDetails();
        res.status(200).json(schema);
    } catch (err) {
        console.error(`Error fetching schema for ${req.params.tableName}:`, err);
        res.status(500).json({ error: err.message });
    }
});

// JSON Seed endpoint (Seeds the true 50-column dataset to Catalyst)
app.get('/seed_all', async (req, res) => {
    try {
        // Read from the root Ireuka folder where python generated the files
        const dataPath = path.join(__dirname, '..', '..', '..');
        let resultsLog = [];
        const ds = req.catalystApp.datastore();
        
        async function insertInChunks(tableName, rows) {
            let insertedCount = 0;
            const table = ds.table(tableName);
            for (let i = 0; i < rows.length; i += 100) {
                const chunk = rows.slice(i, i + 100);
                try {
                    await table.insertRows(chunk);
                    insertedCount += chunk.length;
                    console.log(`Inserted ${insertedCount} into ${tableName}`);
                } catch (e) {
                    console.error(`Error in ${tableName} chunk ${i}: ${e.message}`);
                    resultsLog.push(`Error in ${tableName} chunk ${i}: ${e.message}`);
                    break;
                }
            }
            resultsLog.push(`Table ${tableName}: inserted ${insertedCount}/${rows.length}`);
        }

        // 1. CaseMaster (FIR_Records)
        const firRaw = JSON.parse(fs.readFileSync(path.join(dataPath, 'fir_records.json'), 'utf-8'));
        await insertInChunks('CaseMaster', firRaw);

        // 2. ComplainantDetails
        const compRaw = JSON.parse(fs.readFileSync(path.join(dataPath, 'complainant_records.json'), 'utf-8'));
        await insertInChunks('ComplainantDetails', compRaw);

        // 3. Accused
        const accRaw = JSON.parse(fs.readFileSync(path.join(dataPath, 'accused_records.json'), 'utf-8'));
        await insertInChunks('Accused', accRaw);

        // 4. Victim
        const vicRaw = JSON.parse(fs.readFileSync(path.join(dataPath, 'victim_records.json'), 'utf-8'));
        await insertInChunks('Victim', vicRaw);

        // 5. ArrestSurrender
        const arrRaw = JSON.parse(fs.readFileSync(path.join(dataPath, 'arrest_surrender.json'), 'utf-8'));
        await insertInChunks('ArrestSurrender', arrRaw);

        res.status(200).json({ log: resultsLog });
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

module.exports = app;
