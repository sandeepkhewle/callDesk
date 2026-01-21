const mongoose = require('mongoose');

const entitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    website: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    authcode: {
        type: String
    },
    companyId: {
        type: String,
        index: true,
        unique: true
    }, // third party company id/entity id
    status: {
        type: String,
        enum: ['PENDING', 'ACTIVE', 'SUSPENDED'],
        default: 'PENDING',
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Entity', entitySchema);