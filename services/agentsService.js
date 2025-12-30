const axios = require('axios');

const BASE_URL = process.env.CALLERDESK_BASE_URL;
const API_KEY = process.env.CALLERDESK_API_KEY;

class AgentsService {
    async createAgent(agentData) {
        const { authcode, name, phone } = agentData;

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
