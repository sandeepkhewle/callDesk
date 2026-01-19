const express = require('express');
const webhooksController = require('../controllers/webhooksController');
// Note: Webhooks from external services (Twilio, integration partners) often have varying payloads.
// We are skipping strict body validation here to avoid rejecting valid third-party events.
// Security often relies on signature verification middleware (not implemented in this pass).

const router = express.Router();

// Call status webhook
router.post('/calls', webhooksController.handleCallWebhook);

// SMS webhook
router.post('/sms', webhooksController.handleSmsWebhook);

module.exports = router;
