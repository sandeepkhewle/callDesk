const mongoose = require('mongoose');

const ivrSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    entity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity'
        // Not required initially? If we sync all IVRs, some might be unassigned?
        // Let's make it optional but recommended.
    },
    account_id: {
        type: String,
        trim: true
    },
    did_id: {
        type: String,
        trim: true
    },
    did_number: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    }
}, { timestamps: true });

module.exports = mongoose.model('IVR', ivrSchema);
