const axios = require('axios');
const Entity = require('../models/entity.model');
const apiKeyService = require('./apiKeyService');

const BASE_URL = process.env.CALLERDESK_BASE_URL;

class CallGroupsService {

    async _getApiKey(entityId) {
        if (!entityId) throw new Error("Entity ID required");
        return await apiKeyService.getDecryptedKey(entityId);
    }

    async createCallGroup(callGroupData) {
        const { entityId, name, deskphone_id } = callGroupData;

        const apiKey = await this._getApiKey(entityId);

        const response = await axios.post(`${BASE_URL}/createcallgroup`, {
            authcode: apiKey, // sending dynamic key as authcode payload if required
            group_name: name,
            deskphone_id: deskphone_id
        }, {
            headers: {
                'Authorization': `${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data;
    }

    async updateCallGroup(callGroupData) {
        const { entityId } = callGroupData;
        const apiKey = await this._getApiKey(entityId);

        const response = await axios.post(`${BASE_URL}/updategroup_v2`,
            { ...callGroupData, authcode: apiKey }, // inject authcode/apiKey into payload
            {
                headers: {
                    'Authorization': `${apiKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data;
    }

    async getCallGroups({ entityId, page = 1, limit = 50 }) {
        const apiKey = await this._getApiKey(entityId);

        const response = await axios.post(`${BASE_URL}/getgrouplist_v2`, { authcode: apiKey }, {
            headers: {
                'Authorization': `${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: { authcode: apiKey, current_page: page, per_page: limit }
        });

        return response.data;
    }

    async deleteCallGroup(callGroupData) {
        const { entityId, group_id } = callGroupData;
        const apiKey = await this._getApiKey(entityId);

        const response = await axios.post(`${BASE_URL}/deletegroup`,
            { authcode: apiKey, group_id },
            {
                headers: {
                    'Authorization': `${apiKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data;
    }
}

module.exports = new CallGroupsService();
