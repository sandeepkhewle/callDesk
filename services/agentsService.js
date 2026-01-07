const axios = require('axios');
const Agent = require('../models/agent.model');
const mongoose = require('mongoose');

class AgentsService {

    constructor() {
        this.BASE_URL = process.env.CALLERDESK_BASE_URL;
        this.API_KEY = process.env.CALLERDESK_API_KEY;
    }
    async createAgent(agentData) {
        const { name, phone, entity_id } = agentData;
        const agent_id = Math.floor(1000000 + Math.random() * 9000000).toString();

        const response = await axios.post(`${this.BASE_URL}/addmember_v2`, {
            authcode: this.API_KEY,
            member_name: name,
            member_num: phone,
            access: 2,
            active: 1
        }, {
            headers: {
                'Authorization': `${this.API_KEY}`,
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

    /**
     * Validates agent creation data before creating the agent
     * - Checks if deskphone is already linked to another agent in the same entity
     * - Validates entity existence
     * @param {Object} agentData - Agent data to validate
     * @param {string} agentData.entity_id - Entity ID
     * @param {string} [agentData.deskphone] - Deskphone number (optional)
     * @returns {Object} Validation result with success status and message
     */
    async validateAgentCreation(agentData) {
        const { entity_id, deskphone } = agentData;

        // Check if entity exists
        const Entity = require('../models/entity.model');
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
        const response = await axios.post(`${this.BASE_URL}/updatemember_v2`, agentData, {
            headers: {
                'Authorization': `${this.API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Update local database
        const { member_id, member_name, member_num, } = agentData;
        await Agent.findOneAndUpdate(
            { user_id: member_id },
            { name: member_name, phone: member_num, }
        );

        return response.data;
    }

    async getAgents({ page = 1, limit = 50 }) {
        const response = await axios.post(`${this.BASE_URL}/getmemberlist_V2`, { authcode: this.API_KEY }, {
            headers: {
                'Authorization': `${this.API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: { current_page: page, per_page: limit }
        });

        return response.data;
    }

    async deleteAgent(agentData) {
        const { member_id } = agentData;
        const response = await axios.post(`${this.BASE_URL}/deletemember_v2`,
            { authcode: this.API_KEY, member_id },
            {
                headers: {
                    'Authorization': `${this.API_KEY}`,
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
