const express = require('express');
const os = require('os');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.json({
        message: 'Hello from Migration Demo!',
        hostname: os.hostname(),
        platform: 'VM',
        timestamp: new Date().toISOString(),
        version: 'v1.0'
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`App running on port ${port}`);
});
