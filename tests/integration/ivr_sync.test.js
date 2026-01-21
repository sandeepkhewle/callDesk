const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const entityService = require('../../services/entityService');
const Entity = require('../../models/entity.model');
const IVR = require('../../models/ivr.model');
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
    await IVR.deleteMany({});
    await ApiKey.deleteMany({});
    jest.clearAllMocks();
});

describe('Phase 2: IVR Sync Tests', () => {

    let entity, apiKey;

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
            name: 'Test Key'
        });
        apiKey = keyData.rawKey;
    });

    describe('syncIvrs - Basic Functionality', () => {

        it('should sync IVRs from provider and save to database', async () => {
            // Mock provider response
            axios.post.mockResolvedValue({
                data: {
                    deskphones: [
                        { number: '18005550001', status: 'ACTIVE', label: 'Main Line' },
                        { number: '18005550002', status: 'ACTIVE', label: 'Support' }
                    ]
                }
            });

            const result = await entityService.syncIvrs(entity._id.toString());

            expect(result.success).toBe(true);
            expect(result.synced.created).toBe(2);
            expect(result.synced.updated).toBe(0);
            expect(result.synced.total).toBe(2);

            // Verify IVRs were saved
            const ivrs = await IVR.find({ entity: entity._id });
            expect(ivrs.length).toBe(2);
            expect(ivrs[0].number).toBe('18005550001');
            expect(ivrs[0].status).toBe('ACTIVE');
            expect(ivrs[0].providerLabel).toBe('Main Line');
        });

        it('should update existing IVRs instead of creating duplicates', async () => {
            // Create existing IVR
            await new IVR({
                number: '18005550001',
                entity: entity._id,
                status: 'ACTIVE'
            }).save();

            axios.post.mockResolvedValue({
                data: {
                    deskphones: [
                        { number: '18005550001', status: 'INACTIVE', label: 'Updated Label' }
                    ]
                }
            });

            const result = await entityService.syncIvrs(entity._id.toString());

            expect(result.synced.created).toBe(0);
            expect(result.synced.updated).toBe(1);

            // Verify IVR was updated
            const ivr = await IVR.findOne({ number: '18005550001' });
            expect(ivr.status).toBe('INACTIVE');
            expect(ivr.providerLabel).toBe('Updated Label');
        });

        it('should handle mixed create and update operations', async () => {
            // Create one existing IVR
            await new IVR({
                number: '18005550001',
                entity: entity._id,
                status: 'ACTIVE'
            }).save();

            axios.post.mockResolvedValue({
                data: {
                    deskphones: [
                        { number: '18005550001' }, // Existing
                        { number: '18005550002' }, // New
                        { number: '18005550003' }  // New
                    ]
                }
            });

            const result = await entityService.syncIvrs(entity._id.toString());

            expect(result.synced.created).toBe(2);
            expect(result.synced.updated).toBe(1);
            expect(result.synced.total).toBe(3);
        });

    });

    describe('syncIvrs - Edge Cases', () => {

        it('should reject sync for non-existent entity', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            await expect(entityService.syncIvrs(fakeId.toString()))
                .rejects.toThrow('Entity not found');
        });

        it('should handle empty IVR list from provider', async () => {
            axios.post.mockResolvedValue({
                data: { deskphones: [] }
            });

            const result = await entityService.syncIvrs(entity._id.toString());

            expect(result.success).toBe(true);
            expect(result.synced.total).toBe(0);
        });

        it('should handle provider response with different structure', async () => {
            // Some providers might return data.data instead of data.deskphones
            axios.post.mockResolvedValue({
                data: {
                    data: ['18005550001', '18005550002']
                }
            });

            const result = await entityService.syncIvrs(entity._id.toString());

            expect(result.synced.created).toBe(2);
            const ivrs = await IVR.find({});
            expect(ivrs.length).toBe(2);
        });

        it('should skip invalid IVR entries', async () => {
            axios.post.mockResolvedValue({
                data: {
                    deskphones: [
                        { number: '18005550001' }, // Valid
                        { number: '' },             // Invalid: empty
                        null,                       // Invalid: null
                        { number: '18005550002' }  // Valid
                    ]
                }
            });

            const result = await entityService.syncIvrs(entity._id.toString());

            expect(result.synced.total).toBe(2);
        });

        it('should use API key from the correct entity', async () => {
            axios.post.mockResolvedValue({
                data: { deskphones: [] }
            });

            await entityService.syncIvrs(entity._id.toString());

            // Verify axios was called with correct headers
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/getdeskphone_v2'),
                expect.objectContaining({ authcode: expect.any(String) }),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': expect.any(String)
                    })
                })
            );
        });

    });

});
