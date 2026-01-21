const mongoose = require('mongoose');
const CallsService = require('../../services/callsService');
const AgentsService = require('../../services/agentsService');
const Entity = require('../../models/entity.model');
const Agent = require('../../models/agent.model');
const ApiKey = require('../../models/apiKey.model');
const IVR = require('../../models/ivr.model');
const CallLog = require('../../models/callLog.model');
const axios = require('axios');

jest.mock('axios');

describe('Secure Calling Flow Integration', () => {
    let entityId, agentId, apiKey;

    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/calldesh_test_secure');
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear collections
        await Entity.deleteMany({});
        await Agent.deleteMany({});
        await ApiKey.deleteMany({});
        await IVR.deleteMany({});
        await CallLog.deleteMany({});

        // Setup Base Entity
        const entity = await Entity.create({
            name: 'Test Entity',
            companyId: 'COMP123',
            status: 'ACTIVE'
        });
        entityId = entity._id.toString();

        // Setup API Key with real encryption so decryption works
        const rawKey = 'test-raw-api-key';

        // We need access to the private _encrypt method or mock it. 
        // Since we are in integration test, let's use the service's own method if possible or just mock the storage.
        // Actually, better to just create it properly using the service or manual encryption if we know the secret.
        // Let's rely on the service to create it properly if we can, BUT createApiKey generates a random key.
        // So we will manually replicate the encryption logic here for the test setup OR loosen the mock.

        // Simpler: Just manual encryption using the same default secret as the service
        const crypto = require('crypto');
        const ENCRYPTION_SECRET = '12345678901234567890123456789012'; // Default from service
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_SECRET), iv);
        let encrypted = cipher.update(rawKey);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        apiKey = rawKey; // This is what comes back when decrypted

        await ApiKey.create({
            entity: entityId,
            name: 'Test Key',
            encryptedKey: encrypted.toString('hex'),
            keyHash: 'hash-of-test-key-12345',
            iv: iv.toString('hex')
        });

        // Setup Agent
        const agent = await Agent.create({
            name: 'Test Agent',
            phone: '9876543210',
            entity: entityId,
            user_id: 'MEM123',
            active: 1
        });
        agentId = agent._id.toString();
    });

    test('Should FAIL to assign a deskphone to agent if not in IVR list', async () => {
        const deskphone = '01122334455';

        // Attempt to link DID
        await expect(AgentsService.linkDID({
            member_id: 'MEM123',
            deskphone: deskphone
        })).rejects.toThrow(/Cannot assign deskphone.*not a registered IVR/);
    });

    test('Should FAIL to Click-to-Call if deskphone is not in IVR list (even if assigned)', async () => {
        // Forcefully assign deskphone to agent (bypassing service validation for this test case setup)
        await Agent.updateOne({ user_id: 'MEM123' }, { deskphone: '01122334455' });

        await expect(CallsService.clickToCall({
            calling_party_b: '9988776655',
            agentId: agentId,
            entityId: entityId
        })).rejects.toThrow(/Security Violation: The deskphone.*not a valid active IVR/);
    });

    test('Should SYNC IVRs from provider and allow assignment and calling', async () => {
        const validIVR = '01199887766';

        // Mock Provider Response for syncing
        axios.post.mockResolvedValueOnce({
            data: {
                status: 'success',
                deskphones: [
                    { number: validIVR, friendly_name: 'Main Line' }
                ]
            }
        });

        // 1. Sync IVRs
        const syncResult = await CallsService.syncIvrs(entityId);
        expect(syncResult.count).toBe(1);

        const storedIVR = await IVR.findOne({ number: validIVR, entity: entityId });
        expect(storedIVR).toBeTruthy();
        expect(storedIVR.status).toBe('ACTIVE');

        // 2. Assign valid IVR to Agent
        const updatedAgent = await AgentsService.linkDID({
            member_id: 'MEM123',
            deskphone: validIVR
        });
        expect(updatedAgent.deskphone).toBe(validIVR);

        // 3. Perform Click-to-Call
        axios.get.mockResolvedValueOnce({
            data: {
                call_id: 'CALL_PROVIDER_123',
                status: 'success'
            }
        });

        const callResponse = await CallsService.clickToCall({
            calling_party_b: '9988776655',
            agentId: agentId,
            entityId: entityId
        });

        expect(callResponse.call_id).toBe('CALL_PROVIDER_123');

        // 4. Verify Call Log Creation
        const callLog = await CallLog.findOne({ callId: 'CALL_PROVIDER_123' });
        expect(callLog).toBeTruthy();
        expect(callLog.ivrNumber).toBe(validIVR);
        expect(callLog.status).toBe('RINGING');
    });
});
