const express = require('express');
const multer = require('multer');
const entityController = require('../controllers/entityController');
const validate = require('../middleware/validation.middleware');
const {
    createEntitySchema,
    updateEntitySchema,
    getEntitiesSchema,
    getEntityByIdSchema,
    deleteEntitySchema
} = require('../schemas/entity.schema');

const router = express.Router();
const upload = multer();

// Create entity
router.post('/create', upload.none(), validate(createEntitySchema), entityController.createEntity);

// Update entity
router.post('/update', upload.none(), validate(updateEntitySchema), entityController.updateEntity);

// Get all entities
router.post('/list', upload.none(), validate(getEntitiesSchema), entityController.getEntities);

// Get single entity by ID
router.post('/get', upload.none(), validate(getEntityByIdSchema), entityController.getEntityById);

// Sync IVRs for entity
router.post('/sync-ivrs', upload.none(), validate(getEntityByIdSchema), entityController.syncIvrs);

// Delete entity
router.post('/delete', upload.none(), validate(deleteEntitySchema), entityController.deleteEntity);

module.exports = router;