const express = require('express');
const multer = require('multer');
const callsController = require('../controllers/callsController');

const router = express.Router();

const upload = multer();

// Click to Call
router.get('/clickToCall', upload.none(), callsController.clickToCall);

// Click to Call via Call Group
router.get('/clickToCallViaCallGroup', upload.none(), callsController.clickToCallViaCallGroup);

// Reserve Click to call
router.get('/reserveClickToCall', upload.none(), callsController.reserveClickToCall);

// Call Report
router.post('/callReport', upload.none(), callsController.callReports);

// IVR number list
router.post('/ivrNumbersList', upload.none(), callsController.getIvrNumbersList);

module.exports = router;
