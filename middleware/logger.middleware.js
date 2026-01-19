const morgan = require('morgan');

/**
 * Logger Middleware
 * Uses morgan to log HTTP requests
 */
const logger = (app) => {
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else {
        // Combined format for production (more details)
        app.use(morgan('combined'));
    }
};

module.exports = logger;
