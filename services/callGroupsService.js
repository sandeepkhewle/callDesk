const axios = require('axios');
const Entity = require('../models/entity.model');
const apiKeyService = require('./apiKeyService');

const BASE_URL = process.env.CALLERDESK_BASE_URL;

class CallGroupsService {

    async _getSdkKey(authcode) {
        if (!authcode) throw new Error("Authcode required");
        const entity = await Entity.findOne({ authcode });
        if (!entity) throw new Error("Entity not found for authcode");
        return await apiKeyService.getDecryptedKey(entity._id);
    }

    async createCallGroup(callGroupData) {
        const { authcode, name, deskphone_id } = callGroupData;

        const apiKey = await this._getSdkKey(authcode);

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
        const { authcode } = callGroupData;
        const apiKey = await this._getSdkKey(authcode);

        const response = await axios.post(`${BASE_URL}/updategroup_v2`, callGroupData, {
            headers: {
                'Authorization': `${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data;
    }

    async getCallGroups({ authcode, page = 1, limit = 50 }) {
        const apiKey = await this._getSdkKey(authcode);

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
        const { authcode, group_id } = callGroupData;
        const apiKey = await this._getSdkKey(authcode);

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
