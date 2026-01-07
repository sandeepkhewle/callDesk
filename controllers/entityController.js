const entityService = require('../services/entityService');
const { successResponse, errorResponse } = require('../helpers/responseHelper');

class EntityController {
    /**
     * Creates a new entity.
     * @param {Object} req.body - Request body
     * @param {string} req.body.name - Name of the entity (required)
     * @param {string} [req.body.address] - Address of the entity
     * @param {string} [req.body.phone] - Phone number of the entity
     * @param {string} [req.body.email] - Email of the entity
     * @param {string} [req.body.website] - Website of the entity
     * @param {string} [req.body.description] - Description of the entity
     * @param {string} req.body.authcode - Authentication code for the entity (required)
     * @param {string} [req.body.comapnyId] - Third party company ID
     */
    async createEntity(req, res) {
        try {
            console.log("Creating new entity", req.body);
            const entityData = req.body;

            const data = await entityService.createEntity(entityData);

            successResponse(res, data, 201);
        } catch (error) {
            console.log(error);
            errorResponse(res, error, error.response?.status || 500, 'Failed to create entity');
        }
    }

    /**
     * Updates an existing entity.
     * @param {Object} req.body - Request body
     * @param {string} req.body.entity_id - ID of the entity to update
     * @param {string} [req.body.name] - Name of the entity
     * @param {string} [req.body.address] - Address of the entity
     * @param {string} [req.body.phone] - Phone number of the entity
     * @param {string} [req.body.email] - Email of the entity
     * @param {string} [req.body.website] - Website of the entity
     * @param {string} [req.body.description] - Description of the entity
     * @param {string} [req.body.authcode] - Authentication code for the entity
     * @param {string} [req.body.comapnyId] - Third party company ID
     */
    async updateEntity(req, res) {
        try {
            console.log("Updating entity", req.body);

            const data = await entityService.updateEntity(req.body);

            successResponse(res, data);
        } catch (error) {
            errorResponse(res, error, error.response?.status || 500, 'Failed to update entity');
        }
    }

    /**
     * Retrieves a list of entities.
     * @param {Object} req.body - Request body
     * @param {number} [req.body.page=1] - Page number for pagination
     * @param {number} [req.body.limit=50] - Number of entities per page
     */
    async getEntities(req, res) {
        try {
            const { page = 1, limit = 50 } = req.body;

            const data = await entityService.getEntities({ page, limit });

            successResponse(res, data);
        } catch (error) {
            errorResponse(res, error, error.response?.status || 500, 'Failed to fetch entities');
        }
    }

    /**
     * Retrieves a single entity by ID.
     * @param {Object} req.body - Request body
     * @param {string} req.body.entity_id - ID of the entity to retrieve
     */
    async getEntityById(req, res) {
        try {
            const { entity_id } = req.body;

            const data = await entityService.getEntityById(entity_id);

            successResponse(res, data);
        } catch (error) {
            errorResponse(res, error, error.response?.status || 500, 'Failed to fetch entity');
        }
    }

    /**
     * Deletes an entity.
     * @param {Object} req.body - Request body
     * @param {string} req.body.entity_id - ID of the entity to delete
     */
    async deleteEntity(req, res) {
        try {
            const entityData = req.body;
            const data = await entityService.deleteEntity(entityData);

            successResponse(res, data);
        } catch (error) {
            errorResponse(res, error, error.response?.status || 500, 'Failed to delete entity');
        }
    }
}

module.exports = new EntityController();