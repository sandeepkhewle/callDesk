const Joi = require('joi');

const createCallGroupSchema = Joi.object({
    entityId: Joi.string().required(),
    name: Joi.string().min(2).max(100).required(),
    deskphone_id: Joi.string().required()
});

const updateCallGroupSchema = Joi.object({
    group_id: Joi.string().required(),
    entityId: Joi.string().required(),
    member_id: Joi.number().integer().optional(),
    group_name: Joi.string().min(2).max(100).optional(),
    name: Joi.string().min(2).max(100).optional(), // keeping for backward compatibility if needed, or user can use group_name
    deskphone_id: Joi.string().optional(),
    strategy_check: Joi.number().valid(1, 2, 3, 4, 5, 6).optional(),
    multi_sticky: Joi.number().valid(0, 1, 2).optional(),
    day: Joi.number().valid(1, 2, 3, 4, 5, 6, 7).optional(),
    holiday_prompt_file_name: Joi.string().optional(),
    holiday_prompt_type: Joi.string().valid('Audio', 'Voice Mail').optional(),
    business_hours: Joi.number().valid(0, 1).optional(),
    starttime: Joi.number().integer().min(0).max(2359).optional(), // Assuming 24h format like 900 or 1530, or simpler 0-23? Input said "24 hour format", usually implies string HH:MM or int HH. Let's assume generic integer for now or string. Doc says "(Integer) It should be in 24 hour format". Let's assume HHMM as integer? Or just 0-23? "starttime (Integer) ... endtime (String)". Let's stick to safe string/int loose validation or strictly follow doc. Doc says starttime Integer, endtime String. weird. Let's trust doc.
    endtime: Joi.string().optional(),
    business_hours_prompt_file_name: Joi.string().optional(),
    business_hours_prompt_type: Joi.string().valid('Audio', 'Voice Mail').optional()
}).min(2);

const getCallGroupsSchema = Joi.object({
    entityId: Joi.string().required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50)
});

const deleteCallGroupSchema = Joi.object({
    entityId: Joi.string().required(),
    group_id: Joi.string().required()
});

module.exports = {
    createCallGroupSchema,
    updateCallGroupSchema,
    getCallGroupsSchema,
    deleteCallGroupSchema
};
