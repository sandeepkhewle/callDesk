const request = require('supertest');
const app = require('../../app');
const callGroupsService = require('../../services/callGroupsService');

jest.mock('../../services/callGroupsService');

describe('Call Groups Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /callGroups/create', () => {
        it('should create a call group', async () => {
            const mockBody = { authcode: 'key', name: 'Group 1', deskphone_id: 'did_1' };
            const serviceResponse = { ...mockBody, group_id: 'g1' };
            callGroupsService.createCallGroup.mockResolvedValue(serviceResponse);

            const res = await request(app)
                .post('/callGroups/create')
                .send(mockBody);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(callGroupsService.createCallGroup).toHaveBeenCalledWith(mockBody);
        });
    });

    describe('POST /callGroups/update', () => {
        it('should update a call group', async () => {
            const mockBody = { authcode: 'key', group_id: 'g1', name: 'Group 1 Updated' };
            callGroupsService.updateCallGroup.mockResolvedValue(mockBody);

            const res = await request(app)
                .post('/callGroups/update')
                .send(mockBody);

            expect(res.statusCode).toBe(200);
            expect(callGroupsService.updateCallGroup).toHaveBeenCalledWith(mockBody);
        });
    });

    describe('POST /callGroups/list', () => {
        it('should list call groups', async () => {
            const mockBody = { authcode: 'key', page: 1, limit: 10 };
            const mockResult = { items: [], total: 0 };
            callGroupsService.getCallGroups.mockResolvedValue(mockResult);

            const res = await request(app)
                .post('/callGroups/list')
                .send(mockBody);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toEqual(mockResult);
            expect(callGroupsService.getCallGroups).toHaveBeenCalledWith(mockBody);
        });
    });

    describe('POST /callGroups/delete', () => {
        it('should delete a call group', async () => {
            const mockBody = { authcode: 'key', group_id: 'g1' };
            callGroupsService.deleteCallGroup.mockResolvedValue(true);

            const res = await request(app)
                .post('/callGroups/delete')
                .send(mockBody);

            expect(res.statusCode).toBe(204);
            expect(callGroupsService.deleteCallGroup).toHaveBeenCalledWith(mockBody);
        });
    });
});
