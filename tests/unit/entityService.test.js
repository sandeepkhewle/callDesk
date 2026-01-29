const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

// Mock mongoose model
const mockEntityModel = {
    save: sinon.stub(),
    findByIdAndUpdate: sinon.stub()
};

// Mock Entity constructor
function Entity(data) {
    this.data = data;
    this.save = mockEntityModel.save;
}
Entity.findByIdAndUpdate = mockEntityModel.findByIdAndUpdate;

// Mock other dependencies
const mockIvrModel = {};
const mockApiKeyService = {};
const mockAxios = {};

// Load service with mocked dependencies
const entityService = proxyquire('../../services/entityService', {
    '../models/entity.model': Entity,
    '../models/ivr.model': mockIvrModel,
    './apiKeyService': mockApiKeyService,
    'axios': mockAxios
});

async function runTests() {
    console.log('Running EntityService Tests...');

    // Test createEntity
    console.log('Test 1: createEntity should include fileUrl');
    const createData = {
        name: 'Test Entity',
        companyId: 'comp123',
        fileUrl: 'http://example.com/file.png'
    };

    mockEntityModel.save.resolves(createData);

    const created = await entityService.createEntity(createData);
    assert.strictEqual(created.data.fileUrl, 'http://example.com/file.png');
    console.log('PASS: createEntity included fileUrl');

    // Test updateEntity
    console.log('Test 2: updateEntity should update status and fileUrl');
    const updateData = {
        entity_id: 'ent123',
        status: 'ACTIVE',
        fileUrl: 'http://example.com/updated.png'
    };

    mockEntityModel.findByIdAndUpdate.resolves(updateData);

    const updated = await entityService.updateEntity(updateData);

    // Verify arguments passed to findByIdAndUpdate
    const updateArgs = mockEntityModel.findByIdAndUpdate.getCall(0).args;
    assert.strictEqual(updateArgs[0], 'ent123');
    assert.strictEqual(updateArgs[1].status, 'ACTIVE');
    assert.strictEqual(updateArgs[1].fileUrl, 'http://example.com/updated.png');

    console.log('PASS: updateEntity called with status and fileUrl');

    console.log('All tests passed!');
}

runTests().catch(err => {
    console.error('Test Failed:', err);
    process.exit(1);
});
