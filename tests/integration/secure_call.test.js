const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const callsService = require('../../services/callsService');
const Agent = require('../../models/agent.model');
const Entity = require('../../models/entity.model');
const CallLog = require('../../models/callLog.model');
const ApiKey = require('../../models/apiKey.model');
const apiKeyService = require('../../services/apiKeyService');
const axios = require('axios');

// Mock axios
jest.mock('axios');

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
    await Entity.deleteMany({});
    await Agent.deleteMany({});
    await CallLog.deleteMany({});
    await ApiKey.deleteMany({});
    // Clean up IVR as well
    const IVR = require('../../models/ivr.model');
    await IVR.deleteMany({});
    jest.clearAllMocks();
});

describe('Phase 3: Secure Click-to-Call Tests', () => {

    let entity, agent, apiKey;

    beforeEach(async () => {
        // Setup test data
        entity = await new Entity({
            name: 'Test Entity',
            companyId: 'TEST123',
            status: 'ACTIVE'
        }).save();

        // Create API key for entity
        const keyData = await apiKeyService.createApiKey({
            entityId: entity._id,
            name: 'Test Key',
            key: 'test_api_key_123'
        });
        apiKey = keyData.rawKey;

        agent = await new Agent({
            entity: entity._id,

            user_id: 'USER001',
            name: 'Test Agent',
            phone: '+15551234567',
            deskphone: '18005550001',
            access: 2,
            active: 1
        }).save();

        // Create IVR record
        const IVR = require('../../models/ivr.model');
        await new IVR({
            entity: entity._id,
            number: '18005550001',
            status: 'ACTIVE',
            providerLabel: 'Test IVR'
        }).save();
    });

    describe('clickToCall - Security Tests', () => {

        it('should reject when deskphone is provided (old API)', async () => {
            const callData = {
                calling_party_a: '+15551234567',
                calling_party_b: '+15559876543',
                deskphone: '18005550001', // Should not be accepted
                entityId: entity._id.toString()
            };

            await expect(callsService.clickToCall(callData))
                .rejects.toThrow('agentId');
        });

        it('should fetch deskphone from agent internally', async () => {
            // Mock axios response
            axios.get.mockResolvedValue({
                data: { success: true, call_id: 'CALL123' }
            });

            const callData = {
                calling_party_a: '+15551234567',
                calling_party_b: '+15559876543',
                agentId: agent._id.toString(),
                entityId: entity._id.toString()
            };

            const result = await callsService.clickToCall(callData);

            // Verify that axios was called with internally-fetched deskphone
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('deskphone=18005550001'),
                expect.any(Object)
            );
            expect(result.success).toBe(true);
        });

        it('should reject call if agent does not exist', async () => {
            const callData = {
                calling_party_a: '+15551234567',
                calling_party_b: '+15559876543',
                agentId: new mongoose.Types.ObjectId().toString(), // Non-existent agent
                entityId: entity._id.toString()
            };

            await expect(callsService.clickToCall(callData))
                .rejects.toThrow('Agent not found');
        });

        it('should reject if agent has no deskphone', async () => {
            // Create agent without deskphone
            const agentNoDeskphone = await new Agent({
                entity: entity._id,

                user_id: 'USER002',
                name: 'No Deskphone Agent',
                phone: '+15551111111',
                // No deskphone assigned
                access: 2,
                active: 1
            }).save();

            const callData = {
                calling_party_a: '+15551234567',
                calling_party_b: '+15559876543',
                agentId: agentNoDeskphone._id.toString(),
                entityId: entity._id.toString()
            };

            await expect(callsService.clickToCall(callData))
                .rejects.toThrow('does not have a deskphone assigned');
        });

        it('should reject if agent belongs to different entity', async () => {
            // Create another entity
            const otherEntity = await new Entity({
                name: 'Other Entity',
                companyId: 'OTHER123',
                status: 'ACTIVE'
            }).save();

            const callData = {
                calling_party_a: '+15551234567',
                calling_party_b: '+15559876543',
                agentId: agent._id.toString(), // Agent belongs to 'entity', not 'otherEntity'
                entityId: otherEntity._id.toString()
            };

            await expect(callsService.clickToCall(callData))
                .rejects.toThrow('does not belong to this entity');
        });

    });

    describe('CallLog Creation Tests', () => {

        it('should create CallLog before making the call', async () => {
            axios.get.mockResolvedValue({
                data: { success: true, call_id: 'CALL456' }
            });

            const callData = {
                calling_party_a: '+15551234567',
                calling_party_b: '+15559876543',
                agentId: agent._id.toString(),
                entityId: entity._id.toString()
            };

            await callsService.clickToCall(callData);

            // Verify CallLog was created
            const logs = await CallLog.find({});
            expect(logs.length).toBe(1);
            expect(logs[0].entity.toString()).toBe(entity._id.toString());
            expect(logs[0].agent.toString()).toBe(agent._id.toString());
            expect(logs[0].customerNumber).toBe('+15559876543');
            expect(logs[0].ivrNumber).toBe('18005550001');
            expect(logs[0].status).toBe('RINGING'); // Should be updated after call
            expect(logs[0].callId).toBe('CALL456');
        });

        it('should set initial status to INITIATED', async () => {
            axios.get.mockResolvedValue({
                data: { success: true } // No call_id returned
            });

            const callData = {
                calling_party_a: '+15551234567',
                calling_party_b: '+15559876543',
                agentId: agent._id.toString(),
                entityId: entity._id.toString()
            };

            await callsService.clickToCall(callData);

            const logs = await CallLog.find({});
            expect(logs[0].status).toBe('INITIATED'); // Still INITIATED if no call_id
        });

        it('should update CallLog with provider call_id', async () => {
            axios.get.mockResolvedValue({
                data: { success: true, call_id: 'PROVIDER_CALL_789' }
            });

            const callData = {
                calling_party_a: '+15551234567',
                calling_party_b: '+15559876543',
                agentId: agent._id.toString(),
                entityId: entity._id.toString()
            };

            await callsService.clickToCall(callData);

            const logs = await CallLog.find({});
            expect(logs[0].callId).toBe('PROVIDER_CALL_789');
            expect(logs[0].status).toBe('RINGING');
        });

    });

    describe('reserveClickToCall - Security Tests', () => {

        it('should also use agentId and lookup deskphone', async () => {
            axios.get.mockResolvedValue({
                data: { success: true, call_id: 'RESERVE123' }
            });

            const callData = {
                calling_party_a: '+15559876543', // Receiver
                calling_party_b: '+15551234567', // Agent
                agentId: agent._id.toString(),
                entityId: entity._id.toString()
            };

            const result = await callsService.reserveClickToCall(callData);

            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('deskphone=18005550001'),
                expect.any(Object),
                expect.any(Object)
            );
            expect(result.success).toBe(true);
        });

    });

});
