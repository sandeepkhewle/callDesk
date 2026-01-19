const apiKeyService = require('../services/apiKeyService');
const { successResponse, errorResponse } = require('../helpers/responseHelper');

class ApiKeyController {
    /**
     * Creates a new API key.
     * @param {Object} req.body
     * @param {string} req.body.entityId
     * @param {string} req.body.name
     */
    async createKey(req, res) {
        try {
            const data = await apiKeyService.createApiKey(req.body);
            successResponse(res, data, 201, 'API Key created successfully');
        } catch (error) {
            errorResponse(res, error, 500, 'Failed to create API Key');
        }
    }

    /**
     * Updates an API key.
     * @param {Object} req.params
     * @param {string} req.params.id
     * @param {Object} req.body
     */
    async updateKey(req, res) {
        try {
            const { id } = req.params;
            const data = await apiKeyService.updateApiKey({ id, ...req.body });
            successResponse(res, data, 200, 'API Key updated successfully');
        } catch (error) {
            errorResponse(res, error, 500, 'Failed to update API Key');
        }
    }

    /**
     * Deletes an API key.
     * @param {Object} req.params
     * @param {string} req.params.id
     */
    async deleteKey(req, res) {
        try {
            const { id } = req.params;
            const data = await apiKeyService.deleteApiKey(id);
            successResponse(res, data, 200, 'API Key deleted successfully');
        } catch (error) {
            errorResponse(res, error, 500, 'Failed to delete API Key');
        }
    }

    /**
     * Validates an API key.
     * @param {Object} req.body
     * @param {string} req.body.key
     */
    async validateKey(req, res) {
        try {
            const { key } = req.body;
            if (!key) {
                return errorResponse(res, new Error('API Key is required'), 400);
            }
            const data = await apiKeyService.validateApiKey(key);
            if (!data.isValid) {
                return errorResponse(res, new Error(data.message), 401);
            }
            successResponse(res, data, 200, 'API Key validated successfully');
        } catch (error) {
            errorResponse(res, error, 500, 'Failed to validate API Key');
        }
    }

    /**
     * Gets all API keys for an entity.
     * @param {Object} req.params
     * @param {string} req.params.entityId
     */
    async getKeysByEntity(req, res) {
        try {
            const { entityId } = req.params;
            const data = await apiKeyService.getApiKeysByEntity(entityId);
            successResponse(res, data);
        } catch (error) {
            errorResponse(res, error, 500, 'Failed to fetch API Keys');
        }
    }
}

module.exports = new ApiKeyController();
