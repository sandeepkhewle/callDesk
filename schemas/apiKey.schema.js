const Joi = require('joi');

const createApiKeySchema = Joi.object({
    entityId: Joi.string().required(),
    name: Joi.string().min(2).max(100).required(),
    key: Joi.string().min(10).required() // Enforce some minimum length for security
});

const updateApiKeySchema = Joi.object({
    name: Joi.string().min(2).max(100),
    key: Joi.string().min(10), // Optional key update
    isActive: Joi.boolean()
});

const validateApiKeySchema = Joi.object({
    key: Joi.string().required()
});

module.exports = {
    createApiKeySchema,
    updateApiKeySchema,
    validateApiKeySchema
};
