/**
 * Standardized Response Middleware
 * Attaches a .success and .error method to the response object
 * to ensure consistent API response structure.
 */
const responseHandler = (req, res, next) => {
    /**
     * Send a success response
     * @param {any} data - The data payload
     * @param {string} message - Optional success message
     * @param {number} statusCode - HTTP status code (default 200)
     * @param {object} meta - Optional metadata (pagination, etc.)
     */
    res.success = (data, message = 'Success', statusCode = 200, meta = {}) => {
        res.status(statusCode).json({
            success: true,
            message,
            data,
            meta
        });
    };

    /**
     * Send an error response
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code (default 500)
     * @param {any} error - Original error object or details (optional)
     */
    res.error = (message = 'Internal Server Error', statusCode = 500, error = null) => {
        const responseStub = {
            success: false,
            message
        };

        // Include error details only in development or if specifically requested
        if (process.env.NODE_ENV !== 'production' && error) {
            responseStub.error = error;
            if (error.stack) {
                responseStub.stack = error.stack;
            }
        }

        res.status(statusCode).json(responseStub);
    };

    next();
};

module.exports = responseHandler;
