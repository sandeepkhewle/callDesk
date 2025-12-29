const axios = require('axios');

const BASE_URL = process.env.CALLERDESK_BASE_URL;
const API_KEY = process.env.CALLERDESK_API_KEY;

class CallGroupsService {
    async createCallGroup(callGroupData) {
        const { authcode, name, deskphone_id } = callGroupData;
        const response = await axios.post(`${BASE_URL}/createcallgroup`, {
            authcode,
            group_name: name,
            deskphone_id: deskphone_id
        }, {
            headers: {
                'Authorization': `${API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data;
    }

    async updateCallGroup(callGroupData) {
        const response = await axios.post(`${BASE_URL}/updategroup_v2`, callGroupData, {
            headers: {
                'Authorization': `${API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data;
    }

    async getCallGroups({ authcode, page = 1, limit = 50 }) {
        const response = await axios.post(`${BASE_URL}/getgrouplist_v2`, { authcode }, {
            headers: {
                'Authorization': `${API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: { authcode, current_page: page, per_page: limit }
        });

        return response.data;
    }

    async deleteCallGroup(callGroupData) {
        const { authcode, group_id } = callGroupData;
        const response = await axios.post(`${BASE_URL}/deletegroup`,
            { authcode, group_id },
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

module.exports = new CallGroupsService();
