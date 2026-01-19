const apiKeyService = require('../services/apiKeyService');

class ApiKeyController {
    /**
     * Creates a new API key.
     */
    async createKey(req, res, next) {
        try {
            const data = await apiKeyService.createApiKey(req.body);
            res.success(data, 'API Key created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Updates an API key.
     */
    async updateKey(req, res, next) {
        try {
            const { id } = req.params;
            const data = await apiKeyService.updateApiKey({ id, ...req.body });
            res.success(data, 'API Key updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Deletes an API key.
     */
    async deleteKey(req, res, next) {
        try {
            const { id } = req.params;
            const data = await apiKeyService.deleteApiKey(id);
            res.success(data, 'API Key deleted successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validates an API key.
     */
    async validateKey(req, res, next) {
        try {
            const { key } = req.body;
            // validation handled by middleware now, but keeping check for safety if middleware bypassed
            const data = await apiKeyService.validateApiKey(key);
            if (!data.isValid) {
                return res.error(data.message, 401);
            }
            res.success(data, 'API Key validated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gets all API keys for an entity.
     */
    async getKeysByEntity(req, res, next) {
        try {
            const { entityId } = req.params;
            const data = await apiKeyService.getApiKeysByEntity(entityId);
            res.success(data, 'API Keys fetched successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ApiKeyController();
