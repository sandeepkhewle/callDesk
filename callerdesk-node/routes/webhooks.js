const express = require('express');
const webhooksController = require('../controllers/webhooksController');

const router = express.Router();

// Call status webhook
router.post('/calls', webhooksController.handleCallWebhook);

// SMS webhook
router.post('/sms', webhooksController.handleSmsWebhook);

module.exports = router;
