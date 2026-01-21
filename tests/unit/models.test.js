const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Entity = require('../../models/entity.model');
const IVR = require('../../models/ivr.model');
const CallLog = require('../../models/callLog.model');

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
    await CallLog.deleteMany({});
});

describe('Phase 1: Model Schema Verification', () => {

    describe('Entity Model', () => {
        it('should have a default status of PENDING', async () => {
            const entity = new Entity({
                name: 'Test Entity',
                email: 'test@example.com',
                companyId: 'COMP123'
            });
            await entity.save();
            expect(entity.status).toBe('PENDING');
        });

        it('should allow valid statuses', async () => {
            const entity = new Entity({
                name: 'Active Entity',
                status: 'ACTIVE',
                companyId: 'COMP124'
            });
            await entity.save();
            expect(entity.status).toBe('ACTIVE');
        });

        it('should reject invalid statuses', async () => {
            const entity = new Entity({
                name: 'Bad Entity',
                status: 'INVALID_STATUS',
                companyId: 'COMP125'
            });
            await expect(entity.save()).rejects.toThrow();
        });
    });

    describe('IVR Model', () => {
        it('should create an IVR with required fields', async () => {
            const ivr = new IVR({
                number: '18005550001',
                status: 'ACTIVE'
            });
            await ivr.save();
            expect(ivr.number).toBe('18005550001');
            expect(ivr.status).toBe('ACTIVE');
        });

        it('should enforce unique numbers', async () => {
            await new IVR({ number: '18005550001' }).save();
            const duplicate = new IVR({ number: '18005550001' });
            await expect(duplicate.save()).rejects.toThrow();
        });

        it('should link to an Entity', async () => {
            const entity = await new Entity({ name: 'IVR Owner', companyId: 'C1' }).save();
            const ivr = new IVR({
                number: '18005550002',
                entity: entity._id
            });
            await ivr.save();
            const savedIVR = await IVR.findById(ivr._id).populate('entity');
            expect(savedIVR.entity.name).toBe('IVR Owner');
        });
    });

    describe('CallLog Model', () => {
        let entity;

        beforeEach(async () => {
            entity = await new Entity({ name: 'Call Log Owner', companyId: 'C2' }).save();
        });

        it('should create a CallLog with required fields', async () => {
            const log = new CallLog({
                entity: entity._id,
                customerNumber: '+15551234567',
                ivrNumber: '18005550003',
                direction: 'OUTBOUND'
            });
            await log.save();
            expect(log.status).toBe('INITIATED'); // Default
            expect(log.entity.toString()).toBe(entity._id.toString());
        });

        it('should require entity', async () => {
            const log = new CallLog({
                customerNumber: '+15551234567',
                ivrNumber: '18005550003'
            });
            await expect(log.save()).rejects.toThrow();
        });

        it('should support various call statuses', async () => {
            const statuses = ['INITIATED', 'RINGING', 'ANSWERED', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER'];
            for (const status of statuses) {
                const log = new CallLog({
                    entity: entity._id,
                    customerNumber: '+15551234567',
                    ivrNumber: '18005550099',
                    status: status
                });
                await log.save();
                expect(log.status).toBe(status);
            }
        });
    });
});
