const express = require('express');
const multer = require('multer');
const dashboardSummaryController = require('../controllers/dashboardSummaryController');

const router = express.Router();

const upload = multer();

router.post('/dashboardSummary', upload.none(), dashboardSummaryController.getDashboardSummary);

module.exports = router;