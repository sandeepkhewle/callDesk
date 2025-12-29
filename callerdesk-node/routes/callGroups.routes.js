const express = require('express');
const multer = require('multer');
const callGroupsController = require('../controllers/callGroupsController');

const router = express.Router();

const upload = multer();

// Create call group
router.post('/create', upload.none(), callGroupsController.createCallGroup);

// Update call group
router.post('/update', upload.none(), callGroupsController.updateCallGroup);

// Get all call groups
router.post('/list', upload.none(), callGroupsController.getCallGroups);

// Delete call group
router.post('/delete', upload.none(), callGroupsController.deleteCallGroup);

module.exports = router;
