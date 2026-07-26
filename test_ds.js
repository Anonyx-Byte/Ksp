const catalyst = require('zcatalyst-sdk-node'); const app = catalyst.initialize(); app.datastore().table('TestTable').insertRow({Name: 'Test'}).then(console.log).catch(console.error);
