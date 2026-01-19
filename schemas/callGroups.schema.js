const Joi = require('joi');

const createCallGroupSchema = Joi.object({
    authcode: Joi.string().required(),
    name: Joi.string().min(2).max(100).required(),
    deskphone_id: Joi.string().required()
});

const updateCallGroupSchema = Joi.object({
    group_id: Joi.string().required(),
    authcode: Joi.string().required(),
    name: Joi.string().min(2).max(100),
    deskphone_id: Joi.string()
}).min(2);

const getCallGroupsSchema = Joi.object({
    authcode: Joi.string().required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50)
});

const deleteCallGroupSchema = Joi.object({
    authcode: Joi.string().required(),
    group_id: Joi.string().required()
});

module.exports = {
    createCallGroupSchema,
    updateCallGroupSchema,
    getCallGroupsSchema,
    deleteCallGroupSchema
};
