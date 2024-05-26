const express = require('express');
const suggestment = require('suggestment');
const os = require('os');
const { execSync } = require('child_process');

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Endpoint to get suggestions with default options
app.get('/api', (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).send({ error: 'Query is required' });
    }

    suggestment(query)
        .then(suggestions => res.send({ suggestions }))
        .catch(err => res.status(500).send({ error: err.message }));
});

// Endpoint to get suggestions with custom options
app.get('/api/custom', (req, res) => {
    const query = req.query.q;
    const client = req.query.client || 'heirloom-hp';
    const hl = req.query.hl || 'en';

    if (!query) {
        return res.status(400).send({ error: 'Query is required' });
    }

    const options = { client, hl };

    suggestment(query, options)
        .then(suggestions => res.send({ suggestions }))
        .catch(err => res.status(500).send({ error: err.message }));
});

// Function to get storage information
const getStorageInfo = () => {
    try {
        const dfOutput = execSync('df -h --total').toString();
        const lines = dfOutput.trim().split('\n');
        const totalLine = lines[lines.length - 1];
        const totalData = totalLine.split(/\s+/);
        return {
            total: totalData[1],
            used: totalData[2],
            available: totalData[3],
            usePercentage: totalData[4]
        };
    } catch (error) {
        return { error: 'Unable to fetch storage information' };
    }
};

// Endpoint to get system information
app.get('/api/systeminfo', (req, res) => {
    const systemInfo = {
        platform: os.platform(),
        cpuArchitecture: os.arch(),
        numberOfCPUs: os.cpus().length,
        memory: {
            totalGB: (os.totalmem() / (1024 ** 3)).toFixed(2),
            freeGB: (os.freemem() / (1024 ** 3)).toFixed(2)
        },
        uptime: os.uptime(),
        hostname: os.hostname(),
        networkInterfaces: os.networkInterfaces(),
        storage: getStorageInfo()
    };

    res.send(systemInfo);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
