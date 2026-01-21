const request = require('supertest');
const app = require('../../app');
const dashboardSummaryService = require('../../services/dashboardSummaryService.js');

jest.mock('../../services/dashboardSummaryService.js');

describe('Dashboard Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /dashboard/dashboardSummary', () => {
        it('should get dashboard summary', async () => {
            const mockBody = { entityId: 'e1' };
            const mockResult = { totalCalls: 100 };
            dashboardSummaryService.getDashboardSummary.mockResolvedValue(mockResult);

            const res = await request(app)
                .post('/dashboard/dashboardSummary')
                .send(mockBody);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toEqual(mockResult);
            expect(dashboardSummaryService.getDashboardSummary).toHaveBeenCalledWith('e1');
        });
    });
});
