/**
 * Centralized Error Handling Middleware
 * Catches errors from routes and other middleware.
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Default status code
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        message = `Resource not found`;
        statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        message = 'Duplicate field value entered';
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(val => val.message).join(', ');
        statusCode = 400;
    }

    if (res.error) {
        return res.error(message, statusCode, err);
    }

    // Fallback if res.error is not available
    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
};

module.exports = errorHandler;
