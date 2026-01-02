const axios = require('axios');
const Agent = require('../models/agent.model');
const mongoose = require('mongoose');

const BASE_URL = process.env.CALLERDESK_BASE_URL;
const API_KEY = process.env.CALLERDESK_API_KEY;

class AgentsService {
    async createAgent(agentData) {
        const { authcode, name, phone, entity_id, user_id } = agentData;
        const agent_id = Math.floor(1000000 + Math.random() * 9000000).toString();

        // Save to local database
        const agent = new Agent({
            authcode,
            agent_id,
            entity_id,
            user_id,
            name,
            phone,
            access: 2,
            active: 1
        });

        await agent.save();

        const response = await axios.post(`${BASE_URL}/addmember_v2`, {
            authcode,
            member_name: name,
            member_num: phone,
            access: 2,
            active: 1
        }, {
            headers: {
                'Authorization': `${API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data;
    }

    async updateAgent(agentData) {
        const response = await axios.post(`${BASE_URL}/updatemember_v2`, agentData, {
            headers: {
                'Authorization': `${API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data;
    }

    async getAgents({ authcode, page = 1, limit = 50 }) {
        const response = await axios.post(`${BASE_URL}/getmemberlist_V2`, { authcode }, {
            headers: {
                'Authorization': `${API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: { authcode, current_page: page, per_page: limit }
        });

        return response.data;
    }

    async deleteAgent(agentData) {
        const { authcode, member_id } = agentData;
        const response = await axios.post(`${BASE_URL}/deletemember_v2`,
            { authcode, member_id },
            {
                headers: {
                    'Authorization': `${API_KEY}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data;
    }
}

module.exports = new AgentsService();
