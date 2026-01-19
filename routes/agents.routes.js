const express = require('express');
const router = express.Router();
const agentsController = require('../controllers/agentsController');
const validate = require('../middleware/validation.middleware');
const {
    createAgentSchema,
    updateAgentSchema,
    linkDIDSchema,
    getAgentsSchema
} = require('../schemas/agents.schema');

router.post('/create', validate(createAgentSchema), agentsController.createAgent);
router.post('/validate-creation', agentsController.validateAgentCreation); // Schema needed? or manual?
router.put('/update', validate(updateAgentSchema), agentsController.updateAgent);
router.post('/list', validate(getAgentsSchema), agentsController.getAgents);
router.delete('/delete', agentsController.deleteAgent); // Need schema for delete (member_id)
router.post('/link-did', validate(linkDIDSchema), agentsController.linkDID);

module.exports = router;
