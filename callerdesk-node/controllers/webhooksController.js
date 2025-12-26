const webhooksService = require('../services/webhooksService');

class WebhooksController {
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
