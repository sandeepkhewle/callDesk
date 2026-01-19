const webhooksService = require('../../services/webhooksService');

describe('WebhooksService', () => {
    it('should process call webhook', async () => {
        const data = { call_id: '123', status: 'completed' };
        const result = await webhooksService.processCallWebhook(data);
        expect(result.processed).toBe(true);
        expect(result.data).toEqual(data);
    });

    it('should process sms webhook', async () => {
        const data = { message_id: '456', status: 'delivered' };
        const result = await webhooksService.processSmsWebhook(data);
        expect(result.processed).toBe(true);
        expect(result.data).toEqual(data);
    });
});
