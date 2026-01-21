const Joi = require('joi');

const createEntitySchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    address: Joi.string().allow('', null),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).allow('', null),
    email: Joi.string().email().allow('', null),
    website: Joi.string().uri().allow('', null),
    description: Joi.string().allow('', null),
    companyId: Joi.string().allow('', null).required() // Note: user typo 'comapnyId' fixed
});

const updateEntitySchema = Joi.object({
    entity_id: Joi.string().required(),
    name: Joi.string().min(2).max(100),
    authcode: Joi.string(),
    address: Joi.string().allow('', null),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).allow('', null),
    email: Joi.string().email().allow('', null),
    website: Joi.string().uri().allow('', null),
    description: Joi.string().allow('', null),
    companyId: Joi.string().allow('', null)
}).min(2);

const getEntitiesSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50)
});

const getEntityByIdSchema = Joi.object({
    entity_id: Joi.string().required()
});

const deleteEntitySchema = Joi.object({
    entity_id: Joi.string().required()
});

module.exports = {
    createEntitySchema,
    updateEntitySchema,
    getEntitiesSchema,
    getEntityByIdSchema,
    deleteEntitySchema
};
