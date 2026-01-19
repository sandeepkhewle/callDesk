const ApiKey = require('../models/apiKey.model');
const crypto = require('crypto');

class ApiKeyService {
    /**
     * Generates a random secure API key.
     * @returns {string}
     */
    generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Creates a new API key for an entity.
     * @param {Object} data
     * @param {string} data.entityId
     * @param {string} data.name
     * @returns {Promise<Object>}
     */
    async createApiKey(data) {
        const { entityId, name } = data;
        const key = this.generateKey();

        const apiKey = new ApiKey({
            entity: entityId,
            name,
            key
        });

        await apiKey.save();
        return apiKey;
    }

    /**
     * Updates an API key (name or status).
     * @param {Object} data
     * @param {string} data.id
     * @param {string} [data.name]
     * @param {boolean} [data.isActive]
     * @returns {Promise<Object>}
     */
    async updateApiKey(data) {
        const { id, name, isActive } = data;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedKey = await ApiKey.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedKey) {
            throw new Error('API Key not found');
        }
        return updatedKey;
    }

    /**
     * Deletes an API key.
     * @param {string} id
     * @returns {Promise<Object>}
     */
    async deleteApiKey(id) {
        const deletedKey = await ApiKey.findByIdAndDelete(id);
        if (!deletedKey) {
            throw new Error('API Key not found');
        }
        return deletedKey;
    }

    /**
     * Validates an API key and returns the associated entity.
     * @param {string} key
     * @returns {Promise<Object>}
     */
    async validateApiKey(key) {
        const apiKey = await ApiKey.findOne({ key, isActive: true }).populate('entity');
        if (!apiKey) {
            return { isValid: false, message: 'Invalid or inactive API Key' };
        }
        return { isValid: true, entity: apiKey.entity };
    }

    /**
     * Fetches all API keys for an entity.
     * @param {string} entityId
     * @returns {Promise<Array>}
     */
    async getApiKeysByEntity(entityId) {
        return await ApiKey.find({ entity: entityId });
    }
}

module.exports = new ApiKeyService();
