const request = require('supertest');
const app = require('../../app');
const apiKeyService = require('../../services/apiKeyService');

jest.mock('../../services/apiKeyService');

describe('API Key Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api-keys', () => {
        it('should create an API key', async () => {
            const mockBody = { entityId: 'entity_123', name: 'Test Key' };
            const mockResult = { ...mockBody, key: 'generated_key' };
            apiKeyService.createApiKey.mockResolvedValue(mockResult);

            const res = await request(app)
                .post('/api-keys')
                .send(mockBody);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(apiKeyService.createApiKey).toHaveBeenCalledWith(mockBody);
        });
    });

    describe('GET /api-keys/entity/:entityId', () => {
        it('should get keys by entity', async () => {
            const entityId = 'entity_123';
            const mockKeys = [{ name: 'Key 1' }, { name: 'Key 2' }];
            apiKeyService.getApiKeysByEntity.mockResolvedValue(mockKeys);

            const res = await request(app)
                .get(`/api-keys/entity/${entityId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toEqual(mockKeys);
            expect(apiKeyService.getApiKeysByEntity).toHaveBeenCalledWith(entityId);
        });
    });

    describe('PUT /api-keys/:id', () => {
        it('should update an API key', async () => {
            const id = 'key_123';
            const body = { name: 'Updated Name' };
            const mockResult = { id, ...body };
            apiKeyService.updateApiKey.mockResolvedValue(mockResult);

            const res = await request(app)
                .put(`/api-keys/${id}`)
                .send(body);

            expect(res.statusCode).toBe(200);
            expect(apiKeyService.updateApiKey).toHaveBeenCalledWith({ id, ...body });
        });
    });

    describe('DELETE /api-keys/:id', () => {
        it('should delete an API key', async () => {
            const id = 'key_123';
            apiKeyService.deleteApiKey.mockResolvedValue(true);

            const res = await request(app)
                .delete(`/api-keys/${id}`);

            expect(res.statusCode).toBe(200);
            expect(apiKeyService.deleteApiKey).toHaveBeenCalledWith(id);
        });
    });

    describe('POST /api-keys/validate', () => {
        it('should validate a key successfully', async () => {
            const key = 'valid_key';
            const mockResult = { isValid: true };
            apiKeyService.validateApiKey.mockResolvedValue(mockResult);

            const res = await request(app)
                .post('/api-keys/validate')
                .send({ key });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 401 for invalid key', async () => {
            const key = 'invalid_key';
            const mockResult = { isValid: false, message: 'Invalid key' };
            apiKeyService.validateApiKey.mockResolvedValue(mockResult);

            const res = await request(app)
                .post('/api-keys/validate')
                .send({ key });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
});
