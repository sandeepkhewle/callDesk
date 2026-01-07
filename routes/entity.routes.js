const express = require('express');
const multer = require('multer');
const entityController = require('../controllers/entityController');

const router = express.Router();

const upload = multer();

// Create entity
router.post('/create', upload.none(), entityController.createEntity);

// Update entity
router.post('/update', upload.none(), entityController.updateEntity);

// Get all entities
router.post('/list', upload.none(), entityController.getEntities);

// Get single entity by ID
router.post('/get', upload.none(), entityController.getEntityById);

// Delete entity
router.post('/delete', upload.none(), entityController.deleteEntity);

module.exports = router;