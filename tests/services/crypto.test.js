const apiKeyService = require('../../services/apiKeyService');
const ApiKey = require('../../models/apiKey.model');

// Mock the Mongoose Model
jest.mock('../../models/apiKey.model');

describe('ApiKeyService Encryption Logic', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createApiKey should encrypt key and hash it', async () => {
        // Setup mock
        const mockSave = jest.fn();
        ApiKey.mockImplementation((data) => {
            return {
                ...data,
                save: mockSave,
                toObject: () => data
            };
        });

        const entityId = 'entity123';
        const name = 'Test Key';

        // Execute
        const result = await apiKeyService.createApiKey({ entityId, name });

        // Verify return structure
        expect(result.rawKey).toBeDefined();
        expect(result.rawKey.length).toBe(64); // 32 bytes hex = 64 chars
        expect(result.keyHash).toBeDefined();
        expect(result.encryptedKey).toBeDefined();
        expect(result.iv).toBeDefined();
        expect(result.iv.length).toBe(32); // 16 bytes hex = 32 chars

        // Verify DB Save call
        expect(mockSave).toHaveBeenCalled();
        const savedData = ApiKey.mock.calls[0][0]; // First arg to constructor
        expect(savedData.keyHash).not.toBe(result.rawKey); // Should be hashed
        expect(savedData.encryptedKey).not.toBe(result.rawKey); // Should be encrypted
    });

    test('getDecryptedKey should correctly decrypt the stored key', async () => {
        // 1. Create a key first to get valid encrypted data
        const rawKey = '1234567890abcdef1234567890abcdef'; // 32 chars
        const mockSave = jest.fn();
        let capturedData;
        ApiKey.mockImplementation((data) => {
            capturedData = data;
            return { ...data, save: mockSave, toObject: () => data };
        });

        // We can't easily inject rawKey into createApiKey because it generates it internally.
        // So we will use the internal _encrypt if we could, OR we rely on a full flow helper
        // But since we can't access _encrypt easily, let's reverse generic logic:

        // We will mock findOne to return a MANUALLY encrypted string using the same logic?
        // No, that duplicates test logic.

        // BETTER: Use createApiKey to generate valid encryption, then feed that into getDecryptedKey mock.
        const creationResult = await apiKeyService.createApiKey({ entityId: 'e1', name: 'k1' });
        const { rawKey: originalKey, encryptedKey, iv } = creationResult;

        // Now mock findOne to return this data
        ApiKey.findOne.mockResolvedValue({
            encryptedKey,
            iv,
            entity: 'e1',
            isActive: true
        });

        // Execute extraction
        const decrypted = await apiKeyService.getDecryptedKey('e1');

        // Verify
        expect(decrypted).toBe(originalKey);
    });
});
