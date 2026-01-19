const request = require('supertest');
const app = require('../../app');
const agentsService = require('../../services/agentsService');

jest.mock('../../services/agentsService');

describe('Agents API Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /agents/create', () => {
        it('should create an agent successfully', async () => {
            const mockAgent = { name: 'John Doe', phone: '1234567890', entity_id: 'entity_123' };
            const serviceResponse = { ...mockAgent, _id: 'agent_123' };

            agentsService.createAgent.mockResolvedValue(serviceResponse);

            const res = await request(app)
                .post('/agents/create')
                .send(mockAgent);

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe('agent_123');
            expect(agentsService.createAgent).toHaveBeenCalledWith(mockAgent);
        });

        it('should return 400 validation error if data is invalid', async () => {
            // Missing phone
            const invalidAgent = { name: 'John Doe' };

            const res = await request(app)
                .post('/agents/create')
                .send(invalidAgent);

            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
            // agentsService.createAgent should NOT be called
            expect(agentsService.createAgent).not.toHaveBeenCalled();
        });
    });

    describe('POST /agents/validate-creation', () => {
        it('should validate agent creation data', async () => {
            const mockData = { entity_id: 'entity_123' };
            agentsService.validateAgentCreation.mockResolvedValue({ success: true });

            const res = await request(app)
                .post('/agents/validate-creation')
                .send(mockData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('PUT /agents/update', () => {
        it('should update an agent', async () => {
            const updateData = { member_id: 'agent_123', name: 'Jane Doe' };
            agentsService.updateAgent.mockResolvedValue(updateData);

            const res = await request(app)
                .put('/agents/update')
                .send(updateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.name).toBe('Jane Doe');
            expect(agentsService.updateAgent).toHaveBeenCalledWith(updateData);
        });
    });

    describe('POST /agents/list', () => {
        it('should list agents', async () => {
            // Although validation middleware might enforce defaults/types
            const query = { page: 1, limit: 10 };
            const mockList = { agents: [], total: 0 };
            agentsService.getAgents.mockResolvedValue(mockList);

            const res = await request(app)
                .post('/agents/list')
                .send(query);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toEqual(mockList);
        });
    });

    describe('DELETE /agents/delete', () => {
        it('should delete an agent', async () => {
            const deleteBody = { member_id: 'agent_123' };
            agentsService.deleteAgent.mockResolvedValue(true);

            // Note: Use .send() for body in DELETE, although not standard REST for some, app supports it
            const res = await request(app)
                .delete('/agents/delete')
                .send(deleteBody);

            expect(res.statusCode).toEqual(204);
            expect(agentsService.deleteAgent).toHaveBeenCalledWith(deleteBody);
        });
    });

    describe('POST /agents/link-did', () => {
        it('should link DID to agent', async () => {
            const linkData = { deskphone: 'did_123', member_id: 'agent_123' };
            agentsService.linkDID.mockResolvedValue(linkData);

            const res = await request(app)
                .post('/agents/link-did')
                .send(linkData);

            expect(res.statusCode).toEqual(200);
            expect(agentsService.linkDID).toHaveBeenCalledWith(linkData);
        });
    });
});
