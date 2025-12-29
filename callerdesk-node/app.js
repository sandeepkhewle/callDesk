require('dotenv').config();
const express = require('express');

// Import route modules
const agentsRoutes = require('./routes/agents.routes');
const callGroupsRoutes = require('./routes/callGroups.routes');
const callsRoutes = require('./routes/calls.routes');
const dashRoutes = require('./routes/dashboardSummary.routes');

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
app.use('/calls', callsRoutes);
app.use('/dashboard', dashRoutes)

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
