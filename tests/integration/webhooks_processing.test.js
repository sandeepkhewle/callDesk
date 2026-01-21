const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const webhooksService = require('../../services/webhooksService');
const CallLog = require('../../models/callLog.model');
const Entity = require('../../models/entity.model');
const Agent = require('../../models/agent.model');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await CallLog.deleteMany({});
    await Entity.deleteMany({});
    await Agent.deleteMany({});
});

describe('Phase 4: Webhook Processing Tests', () => {

    let entity, agent, callLog;

    beforeEach(async () => {
        // Setup test data
        entity = await new Entity({
            name: 'Test Entity',
            companyId: 'TEST123',
            status: 'ACTIVE'
        }).save();

        agent = await new Agent({
            entity: entity._id,

            user_id: 'USER001',
            name: 'Test Agent',
            phone: '+15551234567',
            deskphone: '18005550001',
            access: 2,
            active: 1
        }).save();

        callLog = await new CallLog({
            entity: entity._id,
            agent: agent._id,
            callId: 'PROVIDER_CALL_123',
            customerNumber: '+15559876543',
            ivrNumber: '18005550001',
            direction: 'OUTBOUND',
            status: 'INITIATED'
        }).save();
    });

    describe('processCallWebhook - Status Updates', () => {

        it('should update CallLog status from INITIATED to RINGING', async () => {
            const webhookData = {
                call_id: 'PROVIDER_CALL_123',
                status: 'ringing',
                agent_id: 'USER001'
            };

            const result = await webhooksService.processCallWebhook(webhookData);

            expect(result.processed).toBe(true);
            expect(result.callLog.status).toBe('RINGING');

            // Verify in database
            const updatedLog = await CallLog.findById(callLog._id);
            expect(updatedLog.status).toBe('RINGING');
        });

        it('should update CallLog status to ANSWERED', async () => {
            const webhookData = {
                call_id: 'PROVIDER_CALL_123',
                status: 'answered'
            };

            await webhooksService.processCallWebhook(webhookData);

            const updatedLog = await CallLog.findById(callLog._id);
            expect(updatedLog.status).toBe('ANSWERED');
        });

        it('should update CallLog status to COMPLETED with duration', async () => {
            const webhookData = {
                call_id: 'PROVIDER_CALL_123',
                status: 'completed',
                duration: 125
            };

            const result = await webhooksService.processCallWebhook(webhookData);

            expect(result.processed).toBe(true);
            expect(result.callLog.status).toBe('COMPLETED');
            expect(result.callLog.duration).toBe(125);

            const updatedLog = await CallLog.findById(callLog._id);
            expect(updatedLog.status).toBe('COMPLETED');
            expect(updatedLog.duration).toBe(125);
        });

        it('should handle FAILED status', async () => {
            const webhookData = {
                call_id: 'PROVIDER_CALL_123',
                status: 'failed'
            };

            await webhooksService.processCallWebhook(webhookData);

            const updatedLog = await CallLog.findById(callLog._id);
            expect(updatedLog.status).toBe('FAILED');
        });

        it('should handle BUSY status', async () => {
            const webhookData = {
                call_id: 'PROVIDER_CALL_123',
                status: 'busy'
            };

            await webhooksService.processCallWebhook(webhookData);

            const updatedLog = await CallLog.findById(callLog._id);
            expect(updatedLog.status).toBe('BUSY');
        });

        it('should handle NO_ANSWER status with various formats', async () => {
            const formats = ['no_answer', 'no-answer', 'noanswer'];

            for (const format of formats) {
                // Reset status
                callLog.status = 'RINGING';
                await callLog.save();

                const webhookData = {
                    call_id: 'PROVIDER_CALL_123',
                    status: format
                };

                await webhooksService.processCallWebhook(webhookData);

                const updatedLog = await CallLog.findById(callLog._id);
                expect(updatedLog.status).toBe('NO_ANSWER');
            }
        });

    });

    describe('processCallWebhook - Duration Handling', () => {

        it('should update duration when provided as number', async () => {
            const webhookData = {
                call_id: 'PROVIDER_CALL_123',
                duration: 60
            };

            await webhooksService.processCallWebhook(webhookData);

            const updatedLog = await CallLog.findById(callLog._id);
            expect(updatedLog.duration).toBe(60);
        });

        it('should update duration when provided as string', async () => {
            const webhookData = {
                call_id: 'PROVIDER_CALL_123',
                duration: '75'
            };

            await webhooksService.processCallWebhook(webhookData);

            const updatedLog = await CallLog.findById(callLog._id);
            expect(updatedLog.duration).toBe(75);
        });

        it('should only update duration if new value is greater', async () => {
            // Set initial duration
            callLog.duration = 100;
            await callLog.save();

            // Try to update with lower duration
            const webhookData = {
                call_id: 'PROVIDER_CALL_123',
                duration: 50
            };

            await webhooksService.processCallWebhook(webhookData);

            const updatedLog = await CallLog.findById(callLog._id);
            expect(updatedLog.duration).toBe(100); // Should remain unchanged
        });

        it('should update duration if new value is greater', async () => {
            callLog.duration = 50;
            await callLog.save();

            const webhookData = {
                call_id: 'PROVIDER_CALL_123',
                duration: 100
            };

            await webhooksService.processCallWebhook(webhookData);

            const updatedLog = await CallLog.findById(callLog._id);
            expect(updatedLog.duration).toBe(100);
        });

    });

    describe('processCallWebhook - Edge Cases', () => {

        it('should return not processed for non-existent call_id', async () => {
            const webhookData = {
                call_id: 'NON_EXISTENT_CALL',
                status: 'completed'
            };

            const result = await webhooksService.processCallWebhook(webhookData);

            expect(result.processed).toBe(false);
            expect(result.message).toBe('CallLog not found');
        });

        it('should require call_id in webhook data', async () => {
            const webhookData = {
                status: 'completed'
                // Missing call_id
            };

            await expect(webhooksService.processCallWebhook(webhookData))
                .rejects.toThrow('call_id is required');
        });

        it('should handle duplicate webhook events gracefully', async () => {
            const webhookData = {
                call_id: 'PROVIDER_CALL_123',
                status: 'completed',
                duration: 120
            };

            // Process webhook twice
            const result1 = await webhooksService.processCallWebhook(webhookData);
            const result2 = await webhooksService.processCallWebhook(webhookData);

            expect(result1.processed).toBe(true);
            expect(result2.processed).toBe(true);

            // Status should remain the same
            const updatedLog = await CallLog.findById(callLog._id);
            expect(updatedLog.status).toBe('COMPLETED');
            expect(updatedLog.duration).toBe(120);
        });

        it('should handle webhook with only call_id', async () => {
            const webhookData = {
                call_id: 'PROVIDER_CALL_123'
                // No status or duration
            };

            const result = await webhooksService.processCallWebhook(webhookData);

            expect(result.processed).toBe(true);

            // Status should remain unchanged
            const updatedLog = await CallLog.findById(callLog._id);
            expect(updatedLog.status).toBe('INITIATED');
        });

    });

});
