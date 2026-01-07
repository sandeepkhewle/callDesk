const express = require('express');
const multer = require('multer');
const agentsController = require('../controllers/agentsController');

const router = express.Router();

const upload = multer();

// Validate agent creation data
router.post('/validate-creation', upload.none(), agentsController.validateAgentCreation);

// Create agent
router.post('/create', upload.none(), agentsController.createAgent);

// Update agent
router.post('/update', upload.none(), agentsController.updateAgent);

// Get all agents
router.post('/list', upload.none(), agentsController.getAgents);

// Delete agent
router.post('/delete', upload.none(), agentsController.deleteAgent);

// Link DID number to agent
router.post('/link-deskphone', upload.none(), agentsController.linkDID);

module.exports = router;
