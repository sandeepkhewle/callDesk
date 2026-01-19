const express = require('express');
const router = express.Router();
const callsController = require('../controllers/callsController');
const validate = require('../middleware/validation.middleware');
const {
    clickToCallSchema,
    clickToCallViaGroupSchema,
    reserveClickToCallSchema,
    authCodeSchema
} = require('../schemas/calls.schema');

router.post('/click-to-call', validate(clickToCallSchema), callsController.clickToCall);
router.post('/click-to-call-group', validate(clickToCallViaGroupSchema), callsController.clickToCallViaCallGroup);
router.post('/reserve-click-to-call', validate(reserveClickToCallSchema), callsController.reserveClickToCall);
router.post('/reports', validate(authCodeSchema), callsController.callReports); // Assuming authcode is required
router.post('/ivr-numbers', validate(authCodeSchema), callsController.getIvrNumbersList);

module.exports = router;
