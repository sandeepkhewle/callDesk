const Entity = require('../models/entity.model');
const IVR = require('../models/ivr.model');
const apiKeyService = require('./apiKeyService');
const axios = require('axios');

const BASE_URL = process.env.CALLERDESK_BASE_URL;


class EntityService {
    async createEntity(entityData) {
        const { name, address, phone, email, website, description, companyId } = entityData;

        const entity = new Entity({
            name,
            address,
            phone,
            email,
            website,
            description,
            companyId
        });

        await entity.save();

        return entity;
    }

    async updateEntity(entityData) {
        const { entity_id, name, address, phone, email, website, description, authcode, companyId } = entityData;

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
                companyId
            },
            { new: true }
        );

        if (!updatedEntity) {
            throw new Error('Entity not found');
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
