const webhooksService = require('../services/webhooksService');

class WebhooksController {
    /**
     * Handles incoming call webhooks.
     */
    async handleCallWebhook(req, res, next) {
        try {
            // Webhooks often need a quick 200 OK
            // Processing can be async or synchronous depending on requirements
            const result = await webhooksService.processCallWebhook(req.body);
            res.success({ received: true }, 'Webhook received');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handles incoming SMS webhooks.
     */
    async handleSmsWebhook(req, res, next) {
        try {
            const result = await webhooksService.processSmsWebhook(req.body);
            res.success({ received: true }, 'Webhook received');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new WebhooksController();
