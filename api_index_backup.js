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

// Generic endpoint to fetch all data for a specific table
app.get('/table/:tableName', async (req, res) => {
    try {
        const tableName = req.params.tableName;
        const data = await fetchAllRecords(req.catalystApp, tableName);
        res.status(200).json(data);
    } catch (err) {
        console.error(`Error fetching table ${req.params.tableName}:`, err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

module.exports = app;
