const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
    entity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
        required: true
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent'
    },
    callId: {
        type: String,
        index: true
        // Provider's call ID, might be null initially
    },
    customerNumber: {
        type: String,
        required: true
    },
    ivrNumber: {
        type: String,
        required: true
    },
    direction: {
        type: String,
        enum: ['INBOUND', 'OUTBOUND'],
        default: 'OUTBOUND'
    },
    status: {
        type: String,
        enum: ['INITIATED', 'RINGING', 'ANSWERED', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER'],
        default: 'INITIATED'
    },
    duration: {
        type: Number,
        default: 0
    },
    recordingUrl: String
}, { timestamps: true });

module.exports = mongoose.model('CallLog', callLogSchema);
