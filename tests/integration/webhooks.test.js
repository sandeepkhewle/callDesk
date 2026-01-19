const request = require('supertest');
const app = require('../../app');
// Note: if webhooksService doesn't exist, this mock might fail if implementation tries to Require it.
// Assuming it exists or I should check.
// I'll check existence of file first? No, mocking virtual module is possible but if controller requires real one, it must exist.
// Controller says require('../services/webhooksService').

const webhooksService = require('../../services/webhooksService');

jest.mock('../../services/webhooksService');

describe('Webhooks Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /webhooks/calls', () => {
        it('should handle call webhook', async () => {
            const mockBody = { event: 'call_started' };
            webhooksService.processCallWebhook.mockResolvedValue(true);

            const res = await request(app)
                .post('/webhooks/calls')
                .send(mockBody);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(webhooksService.processCallWebhook).toHaveBeenCalledWith(mockBody);
        });
    });

    describe('POST /webhooks/sms', () => {
        it('should handle sms webhook', async () => {
            const mockBody = { message: 'hello' };
            webhooksService.processSmsWebhook.mockResolvedValue(true);

            const res = await request(app)
                .post('/webhooks/sms')
                .send(mockBody);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(webhooksService.processSmsWebhook).toHaveBeenCalledWith(mockBody);
        });
    });
});
