const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');

// Route to create a new API key
router.post('/', apiKeyController.createKey.bind(apiKeyController));

// Route to get all API keys for an entity
router.get('/entity/:entityId', apiKeyController.getKeysByEntity.bind(apiKeyController));

// Route to update an API key
router.put('/:id', apiKeyController.updateKey.bind(apiKeyController));

// Route to delete an API key
router.delete('/:id', apiKeyController.deleteKey.bind(apiKeyController));

// Route to validate an API key
router.post('/validate', apiKeyController.validateKey.bind(apiKeyController));

module.exports = router;
