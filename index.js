const express = require('express');
const suggestment = require('suggestment');

const app = express();
const port = 3000;

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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
