const Joi = require('joi');

const createAgentSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).required(),
    entity_id: Joi.string().required(),
    deskphone: Joi.string().allow('', null).required()
});

const createAgentV2Schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).required(),
    entity_id: Joi.string().required(),
    employee_id: Joi.string().required(),
    deskphone: Joi.string().allow('', null).optional()
});

const updateAgentSchema = Joi.object({
    member_id: Joi.string().required(),
    name: Joi.string().min(2).max(100),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15),
    role: Joi.string().valid('admin', 'agent', 'supervisor'),
    status: Joi.string().valid('active', 'inactive')
}).min(2); // At least member_id and one field to update

const linkDIDSchema = Joi.object({
    member_id: Joi.string().required(),
    deskphone: Joi.string().required()
});

const getAgentsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
    search: Joi.string().allow(''),
    entityId: Joi.string().required()
});

module.exports = {
    createAgentSchema,
    createAgentV2Schema,
    updateAgentSchema,
    linkDIDSchema,
    getAgentsSchema
};
