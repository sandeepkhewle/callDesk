require('dotenv').config();
const express = require('express');

// Import route modules
const agentsRoutes = require('./routes/agents.routes');
const callGroupsRoutes = require('./routes/callGroups.routes');
const axios = require('axios');

const app = express();
app.use(express.json());

// A basic health check
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'CallerDesk REST API Server',
    });
});

// Use route modules
app.use('/agents', agentsRoutes);
app.use('/callGroups', callGroupsRoutes);

//IVR number list
app.use('/ivrNumbersList', (req, res) => {
    const response = axios.post(`${process.env.CALLERDESK_BASE_URL}/getdeskphone_v2`,
        { authcode: req.body.authcode },
        {
            headers: {
                'Authorization': `${process.env.CALLERDESK_API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    ).then((apiResponse) => {
        res.json(apiResponse.data);
    }).catch((error) => {
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch IVR number list',
            details: error.message
        });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        details: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CallerDesk REST API Server listening on port ${PORT}`);
});
