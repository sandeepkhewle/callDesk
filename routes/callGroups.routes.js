const express = require('express');
const multer = require('multer');
const callGroupsController = require('../controllers/callGroupsController');
const validate = require('../middleware/validation.middleware');
const {
    createCallGroupSchema,
    updateCallGroupSchema,
    getCallGroupsSchema,
    deleteCallGroupSchema
} = require('../schemas/callGroups.schema');

const router = express.Router();
const upload = multer();

// Create call group
router.post('/create', upload.none(), validate(createCallGroupSchema), callGroupsController.createCallGroup);

// Update call group
router.post('/update', upload.none(), validate(updateCallGroupSchema), callGroupsController.updateCallGroup);

// Get all call groups
router.post('/list', upload.none(), validate(getCallGroupsSchema), callGroupsController.getCallGroups);

// Delete call group
router.post('/delete', upload.none(), validate(deleteCallGroupSchema), callGroupsController.deleteCallGroup);

module.exports = router;
