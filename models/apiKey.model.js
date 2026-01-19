const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
    entity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
        required: true
    },
    keyHash: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    encryptedKey: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ApiKey', apiKeySchema);
