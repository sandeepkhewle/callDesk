const Joi = require('joi');

const clickToCallSchema = Joi.object({
    calling_party_a: Joi.string().required(), // Agent number
    calling_party_b: Joi.string().required(), // Receiver number
    deskphone: Joi.string().required(),
    authcode: Joi.string().required()
});

const clickToCallViaGroupSchema = Joi.object({
    calling_party_a: Joi.string().required(),
    calling_party_b: Joi.string().required(),
    deskphone: Joi.string().required(),
    authcode: Joi.string().required(),
    group_name: Joi.string().required()
});

const reserveClickToCallSchema = Joi.object({
    calling_party_a: Joi.string().required(), // Receiver
    calling_party_b: Joi.string().required(), // Agent
    deskphone: Joi.string().required(),
    authcode: Joi.string().required()
});

const authCodeSchema = Joi.object({
    authcode: Joi.string().required()
});

module.exports = {
    clickToCallSchema,
    clickToCallViaGroupSchema,
    reserveClickToCallSchema,
    authCodeSchema
};
