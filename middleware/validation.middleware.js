const Joi = require('joi');

/**
 * Middleware to validate request data against a Joi schema
 * @param {Object} schema - Joi schema object
 * @param {string} property - Request property to validate (body, query, params)
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Include all errors
            stripUnknown: true, // Remove unknown fields
            allowUnknown: false // Disallow unknown fields
        });

        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            return res.error(message, 400, error.details);
        }

        // Replace request data with validated (and potentially coerced) data
        req[property] = value;
        next();
    };
};

module.exports = validate;
