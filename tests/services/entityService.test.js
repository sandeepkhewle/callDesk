const entityService = require('../../services/entityService');
const Entity = require('../../models/entity.model');

// Mock Mongoose Model
jest.mock('../../models/entity.model');

describe('EntityService', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createEntity', () => {
        it('should create and return a new entity', async () => {
            const mockSave = jest.fn();
            Entity.mockImplementation((data) => {
                return {
                    ...data,
                    save: mockSave
                };
            });

            const entityData = { name: 'Test Entity', authcode: '123' };
            const result = await entityService.createEntity(entityData);

            expect(result.name).toBe('Test Entity');
            expect(mockSave).toHaveBeenCalled();
        });
    });

    describe('getEntityById', () => {
        it('should return entity if found', async () => {
            const mockEntity = { _id: '1', name: 'Test' };
            Entity.findById.mockResolvedValue(mockEntity);

            const result = await entityService.getEntityById('1');
            expect(result).toEqual(mockEntity);
        });

        it('should throw if not found', async () => {
            Entity.findById.mockResolvedValue(null);
            await expect(entityService.getEntityById('1')).rejects.toThrow('Entity not found');
        });
    });

    // Add more CRUD tests as needed (Update, Delete, List)
    // For brevity in this task, verifying core Create/Read logic.
});
