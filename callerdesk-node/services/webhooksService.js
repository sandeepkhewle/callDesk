class WebhooksService {
    async processCallWebhook(webhookData) {
        const { call_id, status, duration, agent_id } = webhookData;

        // Process webhook data (in a real implementation, you'd save this to database)
        console.log('Call webhook received:', { call_id, status, duration, agent_id });

        // Here you would typically save to database or trigger other actions
        return { processed: true, data: webhookData };
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
