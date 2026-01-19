const Joi = require('joi');

const createApiKeySchema = Joi.object({
    entityId: Joi.string().required(),
    name: Joi.string().min(2).max(100).required()
});

const updateApiKeySchema = Joi.object({
    name: Joi.string().min(2).max(100).required()
});

const validateApiKeySchema = Joi.object({
    key: Joi.string().required()
});

module.exports = {
    createApiKeySchema,
    updateApiKeySchema,
    validateApiKeySchema
};
