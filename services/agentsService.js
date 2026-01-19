const axios = require('axios');
const Agent = require('../models/agent.model');
const Entity = require('../models/entity.model');
const apiKeyService = require('./apiKeyService');
const mongoose = require('mongoose');

class AgentsService {

    constructor() {
        this.BASE_URL = process.env.CALLERDESK_BASE_URL;
    }

    async _getKeyByEntityId(entityId) {
        return await apiKeyService.getDecryptedKey(entityId);
    }

    async _getKeyByAuthCode(authcode) {
        if (!authcode) throw new Error("Authcode required");
        const entity = await Entity.findOne({ authcode });
        if (!entity) throw new Error("Entity not found for authcode");
        return await apiKeyService.getDecryptedKey(entity._id);
    }

    /**
     * Resolves API Key by finding the agent and its associated entity
     * @param {string} member_id 
     */
    async _getKeyByMemberId(member_id) {
        const agent = await Agent.findOne({ user_id: member_id });
        if (!agent) throw new Error("Agent not found locally");
        return await apiKeyService.getDecryptedKey(agent.entity);
    }

    async createAgent(agentData) {
        const { name, phone, entity_id } = agentData;

        // Dynamic Key Lookup
        const apiKey = await this._getKeyByEntityId(entity_id);

        const agent_id = Math.floor(1000000 + Math.random() * 9000000).toString();

        const response = await axios.post(`${this.BASE_URL}/addmember_v2`, {
            authcode: apiKey, // Use the dynamic key as authcode payload if required by API logic, OR just header?
            // Original code sent `authcode: this.API_KEY` in body AND header.
            // We will send dynamic key in both to match legacy behavior.
            member_name: name,
            member_num: phone,
            access: 2,
            active: 1
        }, {
            headers: {
                'Authorization': `${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Save to local database only after successful API call and getting member_id
        const agent = new Agent({
            agent_id,
            entity: entity_id,
            user_id: response.data?.getmember[0]?.member_id,
            name,
            phone,
            access: 2,
            active: 1
        });

        await agent.save();

        return response.data;
    }

    async validateAgentCreation(agentData) {
        const { entity_id, deskphone } = agentData;

        // Check if entity exists
        const entity = await Entity.findById(entity_id);
        if (!entity) {
            return {
                success: false,
                message: 'Entity not found'
            };
        }

        // Check if deskphone is already linked to another agent in the same entity
        if (deskphone) {
            const existingAgent = await Agent.findOne({
                entity: entity_id,
                deskphone: deskphone
            });

            if (existingAgent) {
                return {
                    success: false,
                    message: `Deskphone number ${deskphone} is already linked to another agent`,
                    linkedAgent: existingAgent
                };
            }
        }

        return {
            success: true,
            message: 'Validation passed'
        };
    }

    async updateAgent(agentData) {
        const { member_id, member_name, member_num } = agentData;

        // Dynamic Key Lookup via Member ID
        const apiKey = await this._getKeyByMemberId(member_id);

        const response = await axios.post(`${this.BASE_URL}/updatemember_v2`, agentData, {
            headers: {
                'Authorization': `${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Update local database
        await Agent.findOneAndUpdate(
            { user_id: member_id },
            { name: member_name, phone: member_num, }
        );

        return response.data;
    }

    async getAgents({ page = 1, limit = 50, authcode }) {
        // Require authcode to identify context
        const apiKey = await this._getKeyByAuthCode(authcode);

        const response = await axios.post(`${this.BASE_URL}/getmemberlist_V2`, { authcode: apiKey }, {
            headers: {
                'Authorization': `${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: { current_page: page, per_page: limit }
        });

        return response.data;
    }

    async deleteAgent(agentData) {
        const { member_id } = agentData;

        const apiKey = await this._getKeyByMemberId(member_id);

        const response = await axios.post(`${this.BASE_URL}/deletemember_v2`,
            { authcode: apiKey, member_id },
            {
                headers: {
                    'Authorization': `${apiKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        //delete agent from local database
        await Agent.deleteOne({ user_id: member_id });

        return response.data;
    }

    async linkDID(agentData) {
        const { deskphone, member_id } = agentData;

        // Find agent by member_id, then update deskphone
        const updatedAgent = await Agent.findOneAndUpdate(
            { user_id: member_id },
            { deskphone, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedAgent) {
            throw new Error('Agent not found');
        }

        return updatedAgent;
    }
}

module.exports = new AgentsService();
