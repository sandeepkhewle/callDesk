const ApiKey = require('../models/apiKey.model');
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
// Ensure we have a 32-byte key. In prod, this MUST be in specific env var.
// Fallback is for dev convenience only.
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || '12345678901234567890123456789012';

class ApiKeyService {

    _encrypt(text) {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_SECRET), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
    }

    _decrypt(text, iv) {
        const ivBuffer = Buffer.from(iv, 'hex');
        const encryptedText = Buffer.from(text, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_SECRET), ivBuffer);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

    _hash(text) {
        return crypto.createHash('sha256').update(text).digest('hex');
    }

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
        const rawKey = this.generateKey();

        // 1. Hash for Lookup
        const keyHash = this._hash(rawKey);

        // 2. Encrypt for Retrieval
        const { iv, encryptedData } = this._encrypt(rawKey);

        const apiKey = new ApiKey({
            entity: entityId,
            name,
            keyHash,
            encryptedKey: encryptedData,
            iv
        });

        await apiKey.save();

        // Return the RAW key to the user (once only!)
        return { ...apiKey.toObject(), rawKey };
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
     * @param {string} keyRaw
     * @returns {Promise<Object>}
     */
    async validateApiKey(keyRaw) {
        const keyHash = this._hash(keyRaw);
        const apiKey = await ApiKey.findOne({ keyHash, isActive: true }).populate('entity');

        if (!apiKey) {
            return { isValid: false, message: 'Invalid or inactive API Key' };
        }
        return { isValid: true, entity: apiKey.entity };
    }

    /**
     * Retrieves the DECRYPTED key for an entity.
     * Used when we need to make an outgoing call using this entity's context.
     * @param {string} entityId 
     * @returns {Promise<string>} raw API key
     */
    async getDecryptedKey(entityId) {
        const apiKey = await ApiKey.findOne({ entity: entityId, isActive: true });
        if (!apiKey) {
            throw new Error('No active API Key found for this entity');
        }
        return this._decrypt(apiKey.encryptedKey, apiKey.iv);
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
