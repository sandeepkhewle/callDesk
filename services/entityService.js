const Entity = require('../models/entity.model');

class EntityService {
    async createEntity(entityData) {
        const { name, address, phone, email, website, description, authcode, comapnyId } = entityData;

        const entity = new Entity({
            name,
            address,
            phone,
            email,
            website,
            description,
            authcode,
            comapnyId
        });

        await entity.save();
        return entity;
    }

    async updateEntity(entityData) {
        const { entity_id, name, address, phone, email, website, description, authcode, comapnyId } = entityData;

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
                comapnyId
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
