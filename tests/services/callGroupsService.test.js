const callGroupsService = require('../../services/callGroupsService');
const Entity = require('../../models/entity.model');
const apiKeyService = require('../../services/apiKeyService');
const axios = require('axios');

jest.mock('../../models/entity.model');
jest.mock('../../services/apiKeyService');
jest.mock('axios');

describe('CallGroupsService', () => {

    const FAKE_AUTHCODE = 'AC123';
    const FAKE_KEY = 'decrypted-key-123';

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default mocks for auth flow
        Entity.findOne.mockResolvedValue({ _id: 'entity1' });
        apiKeyService.getDecryptedKey.mockResolvedValue(FAKE_KEY);
    });

    describe('createCallGroup', () => {
        it('should resolve key and call API', async () => {
            axios.post.mockResolvedValue({ data: { success: true } });

            await callGroupsService.createCallGroup({
                authcode: FAKE_AUTHCODE,
                name: 'Group 1',
                deskphone_id: 'D1'
            });

            // Verify Key Lookup
            expect(Entity.findOne).toHaveBeenCalledWith({ authcode: FAKE_AUTHCODE });
            expect(apiKeyService.getDecryptedKey).toHaveBeenCalledWith('entity1');

            // Verify API Call
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/createcallgroup'),
                {
                    authcode: FAKE_KEY,
                    group_name: 'Group 1',
                    deskphone_id: 'D1'
                },
                expect.objectContaining({
                    headers: expect.objectContaining({ 'Authorization': FAKE_KEY })
                })
            );
        });
    });
});
