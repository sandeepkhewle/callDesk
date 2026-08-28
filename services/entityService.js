const Entity = require('../models/entity.model');
const IVR = require('../models/ivr.model');
const apiKeyService = require('./apiKeyService');
const axios = require('axios');

const BASE_URL = process.env.CALLERDESK_BASE_URL;


class EntityService {
    async createEntity(entityData) {
        const { name, address, phone, email, website, description, companyId, fileUrl, key } = entityData;

        const entity = new Entity({
            name,
            address,
            phone,
            email,
            website,
            description,
            companyId,
            fileUrl
        });

        await entity.save();

        // Save the API key against the newly created entity.
        // If key storage fails, roll back the entity so we never leave an entity without a key.
        try {
            await apiKeyService.createApiKey({
                entityId: entity._id,
                name: `${name} API Key`,
                key
            });
        } catch (err) {
            await Entity.findByIdAndDelete(entity._id);
            throw new Error(`Entity created but failed to save API key: ${err.message}`);
        }

        return entity;
    }

    async updateEntity(entityData) {
        const { entity_id, name, address, phone, email, website, description, authcode, companyId, status, fileUrl, key } = entityData;

        const updatedEntity = await Entity.findByIdAndUpdate(
            entity_id,
            {
                name,
                address,
                phone,
                email,
                website,
                description,
                authcode,
                companyId,
                status,
                fileUrl
            },
            { new: true }
        );

        if (!updatedEntity) {
            throw new Error('Entity not found');
        }

        // If a new API key is provided, upsert it against this entity
        if (key) {
            const existingKeys = await apiKeyService.getApiKeysByEntity(entity_id);
            const activeKey = existingKeys.find(k => k.isActive) || existingKeys[0];
            if (activeKey) {
                await apiKeyService.updateApiKey({ id: activeKey._id, key });
            } else {
                await apiKeyService.createApiKey({
                    entityId: entity_id,
                    name: `${name || 'Entity'} API Key`,
                    key
                });
            }
        }

        return updatedEntity;
    }

    async getEntities({ page = 1, limit = 50 }) {
        const skip = (page - 1) * limit;

        const entities = await Entity.find({})
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Entity.countDocuments({});

        return {
            entities,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalEntities: total,
                limit
            }
        };
    }

    async getEntityById(entity_id) {
        const entity = await Entity.findById(entity_id);

        if (!entity) {
            throw new Error('Entity not found');
        }

        return entity;
    }

    /**
     * Syncs IVR numbers from the calling provider and stores them locally
     * @param {string} entityId - The entity ID to sync IVRs for
     * @returns {Promise<Object>} - Sync result with counts
     */
    async syncIvrs(entityId) {
        const ivrSyncService = require('./ivrSyncService');
        return await ivrSyncService.syncIvrsForEntity(entityId);
    }

    async deleteEntity(entityData) {
        const { entity_id } = entityData;

        const deletedEntity = await Entity.findByIdAndDelete(entity_id);

        if (!deletedEntity) {
            throw new Error('Entity not found');
        }

        return deletedEntity;
    }
}

module.exports = new EntityService();
