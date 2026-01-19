const mongoose = require('mongoose');
const entityService = require('../../services/entityService');
const apiKeyService = require('../../services/apiKeyService');
const callsService = require('../../services/callsService');
const axios = require('axios');
const ApiKey = require('../../models/apiKey.model');
const Entity = require('../../models/entity.model');

jest.mock('axios');

describe('Full Integration Flow: Entity -> Key -> Call', () => {

    // We need to allow real DB interaction if possible, or Mock mongoose completely?
    // Mongoose is hard to mock integratedly without mongodb-memory-server.
    // For this environment avoiding heavy install, we will MOCK the Models behavior again,
    // OR mock the Services calls if we want to test coordination.

    // But we want to test the SERVICE LOGIC (e.g. callsService calling apiKeyService).
    // So we should NOT mock apiKeyService.
    // We SHOULD mock Mongoose Models to return what we want.

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('clickToCall should use Encrypted Key from Entity', async () => {
        const fakeAuthCode = 'AUTH_123';
        const fakeEntityId = new mongoose.Types.ObjectId();
        const fakeEntity = {
            _id: fakeEntityId,
            authcode: fakeAuthCode,
            name: 'Test Entity'
        };

        // 1. Mock Entity.findOne to return our entity
        jest.spyOn(Entity, 'findOne').mockResolvedValue(fakeEntity);

        // 2. Create a REAL encrypted key to test apiKeyService decryption
        // We can use the service itself to generate the valid encrypted payload, 
        // to verify integration between apiKeyService.create and callsService.decryption

        // Mock ApiKey.save to do nothing but satisfy service
        jest.spyOn(ApiKey.prototype, 'save').mockResolvedValue(true);

        // Mock ApiKey.findOne to later return what we created
        const createResult = await apiKeyService.createApiKey({ entityId: fakeEntityId, name: 'Test Key' });
        const { rawKey, encryptedKey, iv, keyHash } = createResult;

        // Verify creation output
        expect(rawKey).toBeDefined();

        // Now Mock ApiKey.findOne to return this stored data
        jest.spyOn(ApiKey, 'findOne').mockResolvedValue({
            _id: 'key_id',
            entity: fakeEntityId,
            isActive: true,
            encryptedKey,
            iv,
            keyHash
        });

        // 3. Mock Axios to verify it receives the RAW KEY
        axios.get.mockResolvedValue({ data: { success: true } });

        // 4. Trigger callsService
        await callsService.clickToCall({
            calling_party_a: '100',
            calling_party_b: '200',
            deskphone: '300',
            authcode: fakeAuthCode
        });

        // 5. Verification
        expect(Entity.findOne).toHaveBeenCalledWith({ authcode: fakeAuthCode });
        expect(ApiKey.findOne).toHaveBeenCalledWith({ entity: fakeEntityId, isActive: true });

        // The most important check: Did axios get the Raw Key?
        const axiosCall = axios.get.mock.calls[0];
        const config = axiosCall[1];
        expect(config.headers['Authorization']).toBe(rawKey);
    });
});
