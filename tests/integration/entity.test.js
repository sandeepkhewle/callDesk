const request = require('supertest');
const app = require('../../app');
const entityService = require('../../services/entityService');

jest.mock('../../services/entityService');

describe('Entity Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /entities/create', () => {
        it('should create an entity', async () => {
            const mockBody = { name: 'Entity 1', authcode: 'code123', address: 'Address 1', phone: '1234567890' };
            const mockResult = { ...mockBody, _id: 'e1' };
            entityService.createEntity.mockResolvedValue(mockResult);

            const res = await request(app)
                .post('/entities/create')
                .send(mockBody);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(entityService.createEntity).toHaveBeenCalledWith(mockBody);
        });
    });

    describe('POST /entities/update', () => {
        it('should update an entity', async () => {
            // check schema for required fields
            const mockBody = { entity_id: 'e1', name: 'Entity 1 Updated' };
            entityService.updateEntity.mockResolvedValue(mockBody);

            const res = await request(app)
                .post('/entities/update')
                .send(mockBody);

            expect(res.statusCode).toBe(200);
            expect(entityService.updateEntity).toHaveBeenCalledWith(mockBody);
        });
    });

    describe('POST /entities/list', () => {
        it('should list entities', async () => {
            const mockBody = { page: 1, limit: 10 };
            const mockResult = { entities: [], total: 0 };
            entityService.getEntities.mockResolvedValue(mockResult);

            const res = await request(app)
                .post('/entities/list')
                .send(mockBody);

            expect(res.statusCode).toBe(200);
            expect(entityService.getEntities).toHaveBeenCalledWith(mockBody);
        });
    });

    describe('POST /entities/get', () => {
        it('should get an entity by id', async () => {
            const mockBody = { entity_id: 'e1' };
            const mockResult = { _id: 'e1', name: 'Ent' };
            entityService.getEntityById.mockResolvedValue(mockResult);

            const res = await request(app)
                .post('/entities/get')
                .send(mockBody);

            expect(res.statusCode).toBe(200);
            expect(entityService.getEntityById).toHaveBeenCalledWith('e1');
        });
    });

    describe('POST /entities/delete', () => {
        it('should delete an entity', async () => {
            const mockBody = { entity_id: 'e1' };
            entityService.deleteEntity.mockResolvedValue(true);

            const res = await request(app)
                .post('/entities/delete')
                .send(mockBody);

            expect(res.statusCode).toBe(200);
            expect(entityService.deleteEntity).toHaveBeenCalledWith(mockBody);
        });
    });
});
