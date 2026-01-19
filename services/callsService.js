const axios = require('axios');
const { validateRequired, validateEnvironmentVars } = require('../helpers/validationHelper');
const Entity = require('../models/entity.model');
const apiKeyService = require('./apiKeyService');

const BASE_URL = process.env.CALLERDESK_BASE_URL;

class CallsService {

    /**
     * Helper to retrieve the specific API Key for an Entity using its AuthCode
     * @param {string} authcode 
     * @returns {Promise<string>} decrypted api key
     */
    async _getSdkKey(authcode) {
        if (!authcode) throw new Error("Authcode is required to determine API context");

        const entity = await Entity.findOne({ authcode });
        if (!entity) catchError(new Error("Invalid authcode: Entity not found at " + authcode));
        if (!entity) throw new Error("Invalid authcode: Entity not found");

        return await apiKeyService.getDecryptedKey(entity._id);
    }

    async clickToCall(callData) {
        try {
            // Validate required parameters
            validateRequired(callData, ['calling_party_a', 'calling_party_b', 'deskphone', 'authcode']);

            // Validate environment variables (Base URL only)
            validateEnvironmentVars([
                { name: 'CALLERDESK_BASE_URL', value: BASE_URL }
            ]);

            // Extract validated parameters
            const { calling_party_a, calling_party_b, deskphone, authcode } = callData;

            // Get Dynamic Key
            const apiKey = await this._getSdkKey(authcode);

            const response = await axios.get(`${BASE_URL}/click_to_call_v2?calling_party_a=${calling_party_a}&calling_party_b=${calling_party_b}&deskphone=${deskphone}&authcode=${authcode}&call_from_did=1`,
                {
                    headers: {
                        'Authorization': `${apiKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                }
            );

            return response.data;

        } catch (error) {
            this._handleError(error);
        }
    }

    async clickToCallViaCallGroup(callData) {
        try {
            validateRequired(callData, ['calling_party_a', 'calling_party_b', 'deskphone', 'authcode', 'group_name']);
            validateEnvironmentVars([
                { name: 'CALLERDESK_BASE_URL', value: BASE_URL }
            ]);

            const { calling_party_a, calling_party_b, deskphone, authcode, group_name } = callData;

            const apiKey = await this._getSdkKey(authcode);

            const response = await axios.get(`${BASE_URL}/click_to_call_v2?calling_party_a=${calling_party_a}&calling_party_b=${calling_party_b}&deskphone=${deskphone}&authcode=${authcode}&group_name=${group_name}&call_from_did=1`,
                {
                    headers: {
                        'Authorization': `${apiKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                }
            );
            return response.data;
        } catch (error) {
            this._handleError(error);
        }
    }

    async reserveClickToCall(callData) {
        try {
            validateRequired(callData, ['calling_party_a', 'calling_party_b', 'deskphone', 'authcode']);
            validateEnvironmentVars([
                { name: 'CALLERDESK_BASE_URL', value: BASE_URL }
            ]);

            const { calling_party_a, calling_party_b, deskphone, authcode } = callData;

            const apiKey = await this._getSdkKey(authcode);

            const response = await axios.get(`${BASE_URL}/click_to_call_v3?calling_party_a=${calling_party_a}&calling_party_b=${calling_party_b}&deskphone=${deskphone}&authcode=${authcode}&call_from_did=1`,
                { calling_party_a, calling_party_b, deskphone, authcode },
                {
                    headers: {
                        'Authorization': `${apiKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                }
            );
            return response.data;
        } catch (error) {
            this._handleError(error);
        }
    }

    async callReport(authcode) {
        try {
            if (!authcode) throw new Error("Authcode required");
            const apiKey = await this._getSdkKey(authcode);

            const response = await axios.post(`${BASE_URL}/call_list_v2`,
                { authcode },
                {
                    headers: {
                        'Authorization': `${apiKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            return response.data;
        } catch (error) {
            this._handleError(error);
        }
    }

    async getIvrNumbersList(authcode) {
        try {
            if (!authcode) throw new Error("Authcode required");
            const apiKey = await this._getSdkKey(authcode);

            const response = await axios.post(`${BASE_URL}/getdeskphone_v2`,
                { authcode },
                {
                    headers: {
                        'Authorization': `${apiKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            return response.data;
        } catch (error) {
            this._handleError(error);
        }
    }

    // Centralized error handling helper
    _handleError(error) {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            const msg = data?.message || 'Unknown error';

            if (status === 400) throw new Error(`Bad Request: ${msg}`);
            if (status === 401) throw new Error(`Unauthorized: ${msg}`);
            if (status === 403) throw new Error(`Forbidden: ${msg}`);
            if (status === 404) throw new Error(`Not Found: ${msg}`);
            if (status === 429) throw new Error(`Rate Limited: ${msg}`);
            if (status >= 500) throw new Error(`Server Error: ${msg}`);
            throw new Error(`API Error (${status}): ${msg}`);
        } else if (error.request) {
            throw new Error('Network Error: No response received.');
        } else if (error.code === 'ECONNABORTED') {
            throw new Error('Request Timeout.');
        } else {
            throw error; // Re-throw standard errors
        }
    }
}

module.exports = new CallsService();
