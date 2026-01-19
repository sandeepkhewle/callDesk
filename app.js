require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Import Middleware
const securitySetup = require('./middleware/security.middleware');
const loggerSetup = require('./middleware/logger.middleware');
const inputSanitizer = require('./middleware/input.middleware');
const responseHandler = require('./middleware/response.middleware');
const errorHandler = require('./middleware/error.middleware');

// Import route modules
const agentsRoutes = require('./routes/agents.routes');
const callGroupsRoutes = require('./routes/callGroups.routes');
const callsRoutes = require('./routes/calls.routes');
const dashRoutes = require('./routes/dashboardSummary.routes');
const entityRoutes = require('./routes/entity.routes');
const apiKeyRoutes = require('./routes/apiKey.routes');
const webhooksRoutes = require('./routes/webhooks.js');

const app = express();

// 1. Security Headers & CORS & Rate Limiting
securitySetup(app);

// 2. Logging
loggerSetup(app);

// 3. Body Parsing
// Limit body size to prevent DoS
app.use(express.json({ limit: '10kb' }));

// 4. Input Sanitization (XSS, Mongo Injection)
inputSanitizer(app);

// 5. Response Standardization
app.use(responseHandler);

// Basic health check
app.get('/', (req, res) => {
    res.success({
        status: 'running',
        service: 'CallerDesk REST API Server',
        timestamp: new Date().toISOString()
    }, 'Service is healthy');
});

// 6. Routes
app.use('/agents', agentsRoutes);
app.use('/callGroups', callGroupsRoutes);
app.use('/calls', callsRoutes);
app.use('/dashboard', dashRoutes);
app.use('/entities', entityRoutes);
app.use('/api-keys', apiKeyRoutes);
app.use('/webhooks', webhooksRoutes);

// 7. 404 Handler
app.use((req, res, next) => {
    const error = new Error(`Endpoint not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// 8. Global Error Handler
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/calldesk')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit if DB fails
    });

const PORT = process.env.PORT || 3051;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`CallerDesk REST API Server listening on port ${PORT}`);
    });
}

module.exports = app;
