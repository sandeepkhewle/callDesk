const axios = require('axios');

const BASE_URL = process.env.CALLERDESK_BASE_URL;
const API_KEY = process.env.CALLERDESK_API_KEY;

class dashboardSummaryService {
    async getDashboardSummary(authcode) {
        if (!authcode || authcode.trim() === '') {
            throw new Error('Authcode is required');
        }
        try {
            const response = await axios.post(`${BASE_URL}/dashboard_v2`,
                { authcode },
                {
                    headers: {
                        'Authorization': `${API_KEY}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new dashboardSummaryService();
