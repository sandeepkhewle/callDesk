const axios = require('axios');
const { validateRequired, validateEnvironmentVars } = require('../helpers/validationHelper');
const Entity = require('../models/entity.model');
const Agent = require('../models/agent.model');
const CallLog = require('../models/callLog.model');
const IVR = require('../models/ivr.model');
const apiKeyService = require('./apiKeyService');

const BASE_URL = process.env.CALLERDESK_BASE_URL;

class CallsService {

    /**
     * Helper to retrieve the specific API Key for an Entity using its ID
     * @param {string} entityId 
     * @returns {Promise<string>} decrypted api key
     */
    async _getApiKey(entityId) {
        if (!entityId) throw new Error("Entity ID is required to determine API context");
        return await apiKeyService.getDecryptedKey(entityId);
    }

    async clickToCall(callData) {
        try {
            // SECURITY: No longer accept calling_party_a or deskphone from frontend
            validateRequired(callData, ['calling_party_b', 'agentId', 'entityId']);

            validateEnvironmentVars([
                { name: 'CALLERDESK_BASE_URL', value: BASE_URL }
            ]);

            const { calling_party_b, agentId, entityId } = callData;

            // SECURITY: Fetch agent from database to get phone and deskphone
            const agent = await Agent.findOne({ user_id: agentId });
            if (!agent) {
                throw new Error('Agent not found');
            }
            if (!agent.phone) {
                throw new Error('Agent does not have a phone number');
            }
            if (!agent.deskphone) {
                throw new Error('Agent does not have a deskphone assigned');
            }

            // Verify agent belongs to the entity
            if (agent.entity.toString() !== entityId) {
                throw new Error('Agent does not belong to this entity');
            }

            const calling_party_a = agent.phone; // Agent's phone from DB
            const deskphone = agent.deskphone; // IVR from DB

            // SECURITY: Double-check that this deskphone actually belongs to the entity in our local IVR registry
            // This prevents using a phone number that might have been forcefully assigned to the agent but isn't owned by the entity
            const ivrSyncService = require('./ivrSyncService');
            const ivrRecord = await ivrSyncService.validateIVRForEntity(deskphone, entityId);

            if (!ivrRecord) {
                throw new Error(`Security Violation: The deskphone ${deskphone} is not a valid active IVR for this entity. Please sync IVRs.`);
            }

            // Get Dynamic Key
            const apiKey = await this._getApiKey(entityId);

            // Create CallLog entry BEFORE making the call
            const callLog = new CallLog({
                entity: entityId,
                agent: agent._id,
                customerNumber: calling_party_b,
                ivrNumber: deskphone,
                direction: 'OUTBOUND',
                status: 'INITIATED'
            });
            await callLog.save();

            const response = await axios.get(`${BASE_URL}/click_to_call_v2?calling_party_a=${calling_party_a}&calling_party_b=${calling_party_b}&deskphone=${deskphone}&authcode=${apiKey}&call_from_did=1`,
                {
                    headers: {
                        'Authorization': `${apiKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                }
            );

            // Update callLog with provider's call_id if available
            if (response.data?.call_id) {
                callLog.callId = response.data.call_id;
                callLog.status = 'RINGING';
                await callLog.save();
            }

            return response.data;

        } catch (error) {
            this._handleError(error);
        }
    }

    async clickToCallViaCallGroup(callData) {
        try {
            validateRequired(callData, ['calling_party_a', 'calling_party_b', 'deskphone', 'entityId', 'group_name']);
            validateEnvironmentVars([
                { name: 'CALLERDESK_BASE_URL', value: BASE_URL }
            ]);

            const { calling_party_a, calling_party_b, deskphone, entityId, group_name } = callData;

            const apiKey = await this._getApiKey(entityId);

            const response = await axios.get(`${BASE_URL}/click_to_call_v2?calling_party_a=${calling_party_a}&calling_party_b=${calling_party_b}&deskphone=${deskphone}&authcode=${apiKey}&group_name=${group_name}&call_from_did=1`,
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
            // SECURITY: No longer accept calling_party_a or deskphone from frontend
            validateRequired(callData, ['calling_party_b', 'agentId', 'entityId']);
            validateEnvironmentVars([
                { name: 'CALLERDESK_BASE_URL', value: BASE_URL }
            ]);

            const { calling_party_b, agentId, entityId } = callData;

            // SECURITY: Fetch agent from database to get phone and deskphone
            const agent = await Agent.findById(agentId);
            if (!agent) {
                throw new Error('Agent not found');
            }
            if (!agent.phone) {
                throw new Error('Agent does not have a phone number');
            }
            if (!agent.deskphone) {
                throw new Error('Agent does not have a deskphone assigned');
            }

            // Verify agent belongs to the entity
            if (agent.entity.toString() !== entityId) {
                throw new Error('Agent does not belong to this entity');
            }

            const calling_party_a = calling_party_b; // In reserve, customer calls first
            const calling_party_b_internal = agent.phone; // Then system calls agent
            const deskphone = agent.deskphone;

            // SECURITY: Verify IVR ownership
            const ivrSyncService = require('./ivrSyncService');
            const ivrRecord = await ivrSyncService.validateIVRForEntity(deskphone, entityId);

            if (!ivrRecord) {
                throw new Error(`Security Violation: The deskphone ${deskphone} is not a valid active IVR for this entity. Please sync IVRs.`);
            }

            const apiKey = await this._getApiKey(entityId);

            // Create CallLog entry
            const callLog = new CallLog({
                entity: entityId,
                agent: agentId,
                customerNumber: calling_party_a, // In reserve, party_a is the receiver
                ivrNumber: deskphone,
                direction: 'OUTBOUND',
                status: 'INITIATED'
            });
            await callLog.save();

            const response = await axios.get(`${BASE_URL}/click_to_call_v3?calling_party_a=${calling_party_a}&calling_party_b=${calling_party_b_internal}&deskphone=${deskphone}&authcode=${apiKey}&call_from_did=1`,
                { calling_party_a, calling_party_b: calling_party_b_internal, deskphone, authcode: apiKey },
                {
                    headers: {
                        'Authorization': `${apiKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                }
            );

            // Update callLog with provider's call_id if available
            if (response.data?.call_id) {
                callLog.callId = response.data.call_id;
                callLog.status = 'RINGING';
                await callLog.save();
            }

            return response.data;
        } catch (error) {
            this._handleError(error);
        }
    }

    async callReport(entityId) {
        try {
            if (!entityId) throw new Error("EntityId required");
            const apiKey = await this._getApiKey(entityId);

            const response = await axios.post(`${BASE_URL}/call_list_v2`,
                { authcode: apiKey },
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

    async getIvrNumbersList(entityId) {
        try {
            if (!entityId) throw new Error("EntityId required");
            const apiKey = await this._getApiKey(entityId);

            const response = await axios.post(`${BASE_URL}/getdeskphone_v2`,
                { authcode: apiKey },
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

    async syncIvrs(entityId) {
        try {
            const data = await this.getIvrNumbersList(entityId);
            const ivrList = data?.deskphones || []; // Assuming API returns { deskphones: [...] } or we might need to adjust based on actual response

            const operations = [];

            // If the API returns a flat array or simple object, adaptability is key. 
            // Let's assume it returns an array of objects or strings.
            // Common provider format: { status: 'success', deskphones: [{ number: '...' }, ...] }

            // If ivrList is empty, do nothing or log
            if (!ivrList || ivrList.length === 0) {
                return { count: 0, message: "No IVRs found from provider" };
            }

            for (const item of ivrList) {
                const number = typeof item === 'string' ? item : item.number || item.deskphone;
                if (number) {
                    operations.push({
                        updateOne: {
                            filter: { number: number, entity: entityId },
                            update: {
                                $set: {
                                    status: 'ACTIVE',
                                    providerLabel: item.friendly_name || item.name || 'Synced from Provider'
                                }
                            },
                            upsert: true
                        }
                    });
                }
            }

            if (operations.length > 0) {
                await IVR.bulkWrite(operations);
            }

            return { count: operations.length, message: "IVRs synced successfully" };

        } catch (error) {
            console.error("Sync IVR Error:", error);
            throw error;
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
