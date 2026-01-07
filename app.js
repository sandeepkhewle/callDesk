require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Import route modules
const agentsRoutes = require('./routes/agents.routes');
const callGroupsRoutes = require('./routes/callGroups.routes');
const callsRoutes = require('./routes/calls.routes');
const dashRoutes = require('./routes/dashboardSummary.routes');
const entityRoutes = require('./routes/entity.routes');

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
app.use('/dashboard', dashRoutes);
app.use('/entities', entityRoutes);

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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/calldesk')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`CallerDesk REST API Server listening on port ${PORT}`);
});
