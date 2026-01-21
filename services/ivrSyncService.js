const IVR = require('../models/ivr.model');
const Entity = require('../models/entity.model');
const apiKeyService = require('./apiKeyService');
const axios = require('axios');

const BASE_URL = process.env.CALLERDESK_BASE_URL;

class IVRSyncService {
    /**
     * Syncs IVR numbers from the calling provider and stores them locally
     * @param {string} entityId - The entity ID to sync IVRs for
     * @returns {Promise<Object>} - Sync result with counts
     */
    async syncIvrsForEntity(entityId) {
        // Verify entity exists
        const entity = await Entity.findById(entityId);
        if (!entity) {
            throw new Error('Entity not found');
        }

        // Get API key for this entity
        const apiKey = await apiKeyService.getDecryptedKey(entityId);

        // Fetch IVRs from provider
        const response = await axios.post(`${BASE_URL}/getdeskphone_v2`,
            { authcode: apiKey },
            {
                headers: {
                    'Authorization': `${apiKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        // Parse IVR list from response
        const ivrList = response.data?.deskphones || response.data?.getdeskphone || [];

        let created = 0;
        let updated = 0;

        // Upsert each IVR
        for (const ivrData of ivrList) {
            // Skip null/undefined entries
            if (!ivrData) continue;

            // Assuming each IVR has at least a 'number' field
            const number = ivrData.number || ivrData.deskphone || ivrData;

            if (typeof number === 'string' && number.trim()) {
                const existingIVR = await IVR.findOne({ number: number.trim() });

                if (existingIVR) {
                    // Update existing IVR
                    existingIVR.entity = entityId;
                    existingIVR.status = ivrData.status || 'ACTIVE';
                    existingIVR.providerLabel = ivrData.label || ivrData.name || '';
                    existingIVR.did_id = ivrData.did_id || '';
                    existingIVR.did_number = ivrData.did_num || '';
                    existingIVR.account_id = ivrData.account_id || '';
                    await existingIVR.save();
                    updated++;
                } else {
                    // Create new IVR
                    const newIVR = new IVR({
                        number: number.trim(),
                        entity: entityId,
                        status: ivrData.status || 'ACTIVE',
                        providerLabel: ivrData.label || ivrData.name || '',
                        did_id: ivrData.did_id || '',
                        account_id: ivrData.account_id || '',
                        did_number: ivrData.did_num || ''
                    });
                    await newIVR.save();
                    created++;
                }
            }
        }

        return {
            success: true,
            entity: entity.name,
            synced: {
                created,
                updated,
                total: created + updated
            }
        };
    }

    /**
     * Get all IVRs for an entity
     * @param {string} entityId - The entity ID
     * @returns {Promise<Array>} - Array of IVR records
     */
    async getIVRsByEntity(entityId) {
        return await IVR.find({ entity: entityId, status: 'ACTIVE' });
    }

    /**
     * Validate if a deskphone number is a valid IVR for an entity
     * @param {string} deskphone - The deskphone number to validate
     * @param {string} entityId - The entity ID
     * @returns {Promise<Object|null>} - IVR record if valid, null otherwise
     */
    async validateIVRForEntity(deskphone, entityId) {
        return await IVR.findOne({
            number: deskphone,
            entity: entityId,
            status: 'ACTIVE'
        });
    }
}

module.exports = new IVRSyncService();
