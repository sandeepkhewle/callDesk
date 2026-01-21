const CallLog = require('../models/callLog.model');

class WebhooksService {
    async processCallWebhook(webhookData) {
        const { call_id, status, duration, agent_id } = webhookData;

        // Validate required fields
        if (!call_id) {
            throw new Error('call_id is required in webhook data');
        }

        // Find the call log by provider's call_id
        const callLog = await CallLog.findOne({ callId: call_id });

        if (!callLog) {
            // Log for debugging but don't fail - provider might send webhooks for calls not in our system
            console.warn(`CallLog not found for call_id: ${call_id}`);
            return {
                processed: false,
                message: 'CallLog not found',
                data: webhookData
            };
        }

        // Update call status if provided
        if (status) {
            // Map provider status to our internal status
            const statusMap = {
                'initiated': 'INITIATED',
                'ringing': 'RINGING',
                'answered': 'ANSWERED',
                'completed': 'COMPLETED',
                'failed': 'FAILED',
                'busy': 'BUSY',
                'no_answer': 'NO_ANSWER',
                'no-answer': 'NO_ANSWER',
                'noanswer': 'NO_ANSWER'
            };

            const normalizedStatus = status.toLowerCase();
            const mappedStatus = statusMap[normalizedStatus] || status.toUpperCase();

            // Only update if the status is different (prevent duplicate webhook processing)
            if (callLog.status !== mappedStatus) {
                callLog.status = mappedStatus;
            }
        }

        // Update duration if provided and greater than current
        if (duration !== undefined && duration !== null) {
            const durationNumber = typeof duration === 'string' ? parseInt(duration, 10) : duration;
            if (!isNaN(durationNumber) && durationNumber > callLog.duration) {
                callLog.duration = durationNumber;
            }
        }

        // Save the updated call log
        await callLog.save();

        console.log(`Webhook processed for call_id: ${call_id}, status: ${callLog.status}`);

        return {
            processed: true,
            callLog: {
                id: callLog._id,
                callId: callLog.callId,
                status: callLog.status,
                duration: callLog.duration
            },
            data: webhookData
        };
    }

    async processSmsWebhook(webhookData) {
        const { message_id, status, to_number, from_number } = webhookData;

        // Process webhook data
        console.log('SMS webhook received:', { message_id, status, to_number, from_number });

        // Here you would typically save to database or trigger other actions
        return { processed: true, data: webhookData };
    }
}

module.exports = new WebhooksService();
