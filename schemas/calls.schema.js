const Joi = require('joi');

const clickToCallSchema = Joi.object({
    calling_party_b: Joi.string().required(), // Customer/Receiver number (ONLY frontend input)
    agentId: Joi.string().required(), // Agent ID - used to lookup phone and deskphone
    entityId: Joi.string().required()
});

const clickToCallViaGroupSchema = Joi.object({
    calling_party_a: Joi.string().required(),
    calling_party_b: Joi.string().required(),
    deskphone: Joi.string().required(),
    entityId: Joi.string().required(),
    group_name: Joi.string().required()
});

const reserveClickToCallSchema = Joi.object({
    calling_party_b: Joi.string().required(), // Customer number
    agentId: Joi.string().required(), // Agent ID - used to lookup phone and deskphone
    entityId: Joi.string().required()
});

const authCodeSchema = Joi.object({
    entityId: Joi.string().required()
});

module.exports = {
    clickToCallSchema,
    clickToCallViaGroupSchema,
    reserveClickToCallSchema,
    authCodeSchema
};
