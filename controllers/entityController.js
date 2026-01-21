const entityService = require('../services/entityService');

class EntityController {
    /**
     * Creates a new entity.
     */
    async createEntity(req, res, next) {
        try {
            console.log("Creating new entity", req.body);
            const data = await entityService.createEntity(req.body);
            res.success(data, 'Entity created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Updates an existing entity.
     */
    async updateEntity(req, res, next) {
        try {
            console.log("Updating entity", req.body);
            const data = await entityService.updateEntity(req.body);
            res.success(data, 'Entity updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retrieves a list of entities.
     */
    async getEntities(req, res, next) {
        try {
            const { page, limit } = req.body;
            const data = await entityService.getEntities({ page, limit });
            res.success(data, 'Entities fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retrieves a single entity by ID.
     */
    async getEntityById(req, res, next) {
        try {
            const { entity_id } = req.body;
            const data = await entityService.getEntityById(entity_id);
            res.success(data, 'Entity fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Syncs IVR numbers from provider for an entity.
     */
    async syncIvrs(req, res, next) {
        try {
            const { entity_id } = req.body;
            const data = await entityService.syncIvrs(entity_id);
            res.success(data, 'IVRs synced successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Deletes an entity.
     */
    async deleteEntity(req, res, next) {
        try {
            const data = await entityService.deleteEntity(req.body);
            res.success(data, 'Entity deleted successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EntityController();