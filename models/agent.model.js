const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    authcode: {
        type: String,
        required: true,
        index: true
    },
    entity_id: {
        type: String,
        required: true
    },
    agent_id: {
        type: String,
        required: true,
        unique: true
    },
    user_id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    deskphone: {
        type: String,
        trim: true
    },
    access: {
        type: Number,
        default: 2
    },
    active: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Agent', agentSchema);
