const webhooksService = require('../services/webhooksService');

class WebhooksController {
    /**
     * Handles incoming call webhooks.
     * @param {Object} req.body - Request body
     * @param {string} req.body.call_id - Unique identifier for the call
     * @param {string} req.body.status - Status of the call
     * @param {string} req.body.duration - Duration of the call
     * @param {string} req.body.agent_id - ID of the agent involved in the call
     */
    async handleCallWebhook(req, res) {
        try {
            const { call_id, status, duration, agent_id } = req.body;

            const result = await webhooksService.processCallWebhook({ call_id, status, duration, agent_id });

            res.status(200).json({ received: true });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to process call webhook',
                details: error.message
            });
        }
    }

    /**
     * Handles incoming SMS webhooks.
     * @param {Object} req.body - Request body
     * @param {string} req.body.message_id - Unique identifier for the SMS message
     * @param {string} req.body.status - Status of the SMS
     * @param {string} req.body.to_number - Recipient phone number
     * @param {string} req.body.from_number - Sender phone number
     */
    async handleSmsWebhook(req, res) {
        try {
            const { message_id, status, to_number, from_number } = req.body;

            const result = await webhooksService.processSmsWebhook({ message_id, status, to_number, from_number });

            res.status(200).json({ received: true });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to process SMS webhook',
                details: error.message
            });
        }
    }
}

module.exports = new WebhooksController();
