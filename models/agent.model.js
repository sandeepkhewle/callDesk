const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    entity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
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
    }
}, { timestamps: true });

// Compound unique index on entity and deskphone
agentSchema.index({ entity: 1, deskphone: 1 }, { unique: true });

module.exports = mongoose.model('Agent', agentSchema);
