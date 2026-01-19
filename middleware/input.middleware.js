const mongoSanitize = require('express-mongo-sanitize');

/**
 * Input Sanitization Middleware
 */
const inputSanitizer = (app) => {
    // Custom middleware to sanitize without replacing req.query/params objects
    app.use((req, res, next) => {
        // Sanitize body
        if (req.body) {
            mongoSanitize.sanitize(req.body);
        }

        // Sanitize query
        if (req.query) {
            mongoSanitize.sanitize(req.query);
        }

        // Sanitize params
        if (req.params) {
            mongoSanitize.sanitize(req.params);
        }

        next();
    });

    // Prevent XSS attacks - disabled for now due to similar issues or deprecation
    // app.use(xss());
};

module.exports = inputSanitizer;
