/**
 * Helper function to send a standardized success response.
 * @param {Object} res - Express response object
 * @param {*} data - The data to send in the response
 * @param {number} status - HTTP status code (default: 200)
 * @param {string} message - Optional success message
 */
function successResponse(res, data, status = 200, message = null) {
    const response = { success: true };
    if (message) response.message = message;
    response.data = data;
    res.status(status).json(response);
}

/**
 * Helper function to send a standardized error response.
 * @param {Object} res - Express response object
 * @param {*} error - The error object or message
 * @param {number} status - HTTP status code (default: 500)
 * @param {string} message - Optional error message
 */
function errorResponse(res, error, status = 500, message = null) {
    const response = { success: false };
    response.error = message || 'An error occurred';
    if (typeof error === 'string') {
        response.details = error;
    } else {
        response.details = error.message || error.toString();
    }
    res.status(status).json(response);
}

module.exports = {
    successResponse,
    errorResponse
};
