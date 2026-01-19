const express = require('express');
const multer = require('multer');
const dashboardSummaryController = require('../controllers/dashboardSummaryController');
const validate = require('../middleware/validation.middleware');
const { authCodeSchema } = require('../schemas/calls.schema'); // Reusing authCodeSchema

const router = express.Router();
const upload = multer();

router.post('/dashboardSummary', upload.none(), validate(authCodeSchema), dashboardSummaryController.getDashboardSummary);

module.exports = router;