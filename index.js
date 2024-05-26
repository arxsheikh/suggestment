const express = require('express');
const suggestment = require('suggestment');
const os = require('os');
const fs = require('fs');
const path = require('path');

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

// Function to list all files recursively in a directory
const listAllFiles = (dirPath, fileList = []) => {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            listAllFiles(fullPath, fileList);
        } else {
            fileList.push(fullPath);
        }
    });

    return fileList;
};

// Endpoint to get system information
app.get('/api/systeminfo', (req, res) => {
    const uptime = os.uptime();
    const systemInfo = {
        platform: os.platform(),
        cpuArchitecture: os.arch(),
        numberOfCPUs: os.cpus().length,
        memory: {
            totalGB: (os.totalmem() / (1024 ** 3)).toFixed(2),
            freeGB: (os.freemem() / (1024 ** 3)).toFixed(2)
        },
        uptime: {
            seconds: uptime,
            hours: (uptime / 3600).toFixed(2),
            days: (uptime / 86400).toFixed(2),
            months: (uptime / (86400 * 30.44)).toFixed(2) // using average month length
        },
        hostname: os.hostname(),
        networkInterfaces: os.networkInterfaces(),
        storage: getStorageInfo()
    };

    res.send(systemInfo);
});

// Endpoint to list all files in the root directory
app.get('/api/listfiles', (req, res) => {
    const rootDir = '/'; // Root directory for Linux

    try {
        const allFiles = listAllFiles(rootDir);
        res.send({ files: allFiles });
    } catch (err) {
        res.status(500).send({ error: 'Unable to list files', details: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
