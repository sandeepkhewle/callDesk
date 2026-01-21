const request = require('supertest');
const app = require('../../app');
const callsService = require('../../services/callsService');

jest.mock('../../services/callsService');

describe('Calls API Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /calls/click-to-call', () => {
        it('should initiate click to call', async () => {
            // check schema for required fields
            const mockBody = {
                entityId: 'e1',
                calling_party_a: '100',
                calling_party_b: '200',
                deskphone: '300'
            };
            callsService.clickToCall.mockResolvedValue({ success: true, message: 'Initiated' });

            const res = await request(app)
                .post('/calls/click-to-call')
                .send(mockBody);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(callsService.clickToCall).toHaveBeenCalledWith(mockBody);
        });
    });

    describe('POST /calls/click-to-call-group', () => {
        it('should initiate click to call group', async () => {
            // check schema
            const mockBody = {
                entityId: 'e1',
                calling_party_a: '100',
                calling_party_b: '200',
                deskphone: '300',
                group_name: 'Sales'
            };
            callsService.clickToCallViaCallGroup.mockResolvedValue({ success: true });

            const res = await request(app)
                .post('/calls/click-to-call-group')
                .send(mockBody);

            expect(res.statusCode).toBe(200);
            expect(callsService.clickToCallViaCallGroup).toHaveBeenCalledWith(mockBody);
        });
    });

    describe('POST /calls/reserve-click-to-call', () => {
        it('should initiate reserve click to call', async () => {
            const mockBody = {
                entityId: 'e1',
                calling_party_a: '100',
                calling_party_b: '200',
                deskphone: '300'
            };
            callsService.reserveClickToCall.mockResolvedValue({ success: true });

            const res = await request(app)
                .post('/calls/reserve-click-to-call')
                .send(mockBody);

            expect(res.statusCode).toBe(200);
            expect(callsService.reserveClickToCall).toHaveBeenCalledWith(mockBody);
        });
    });

    describe('POST /calls/reports', () => {
        it('should get call reports', async () => {
            const mockBody = { entityId: 'e1' };
            const mockResult = [{ id: 1, duration: 60 }];
            callsService.callReport.mockResolvedValue(mockResult);

            const res = await request(app)
                .post('/calls/reports')
                .send(mockBody);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toEqual(mockResult);
            expect(callsService.callReport).toHaveBeenCalledWith('e1');
        });
    });

    describe('POST /calls/ivr-numbers', () => {
        it('should get ivr numbers', async () => {
            const mockBody = { entityId: 'e1' };
            const mockResult = ['123', '456'];
            callsService.getIvrNumbersList.mockResolvedValue(mockResult);

            const res = await request(app)
                .post('/calls/ivr-numbers')
                .send(mockBody);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toEqual(mockResult);
            expect(callsService.getIvrNumbersList).toHaveBeenCalledWith('e1');
        });
    });
});
