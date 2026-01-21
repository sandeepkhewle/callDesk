const express = require('express');
const router = express.Router();
const agentsController = require('../controllers/agentsController');
const validate = require('../middleware/validation.middleware');
const {
    createAgentSchema,
    createAgentV2Schema,
    updateAgentSchema,
    linkDIDSchema,
    getAgentsSchema
} = require('../schemas/agents.schema');

router.post('/create', validate(createAgentSchema), agentsController.createAgent);
router.post('/create-v2', validate(createAgentV2Schema), agentsController.createAgentV2);
router.post('/validate-creation', agentsController.validateAgentCreation); // Schema needed? or manual?
router.put('/update', validate(updateAgentSchema), agentsController.updateAgent);
router.post('/list', validate(getAgentsSchema), agentsController.getAgents);
router.delete('/delete', agentsController.deleteAgent); // Need schema for delete (member_id)
router.post('/link-did', validate(linkDIDSchema), agentsController.linkDID);

// Route to sync agents
router.post('/sync/:entityId', agentsController.syncAgents.bind(agentsController));

module.exports = router;
