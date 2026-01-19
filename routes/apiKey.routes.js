const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const validate = require('../middleware/validation.middleware');
const {
    createApiKeySchema,
    updateApiKeySchema,
    validateApiKeySchema
} = require('../schemas/apiKey.schema');

// Route to create a new API key
router.post('/', validate(createApiKeySchema), apiKeyController.createKey.bind(apiKeyController));

// Route to get all API keys for an entity
router.get('/entity/:entityId', apiKeyController.getKeysByEntity.bind(apiKeyController));

// Route to update an API key
router.put('/:id', validate(updateApiKeySchema), apiKeyController.updateKey.bind(apiKeyController));

// Route to delete an API key
router.delete('/:id', apiKeyController.deleteKey.bind(apiKeyController));

// Route to validate an API key
router.post('/validate', validate(validateApiKeySchema), apiKeyController.validateKey.bind(apiKeyController));

module.exports = router;
