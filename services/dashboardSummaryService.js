const axios = require('axios');
const apiKeyService = require('./apiKeyService');

const BASE_URL = process.env.CALLERDESK_BASE_URL;
const API_KEY = process.env.CALLERDESK_API_KEY;

class dashboardSummaryService {
    async getDashboardSummary(entityId) {
        if (!entityId || entityId.trim() === '') {
            throw new Error('Entity ID is required');
        }
        try {
            const apiKey = await apiKeyService.getDecryptedKey(entityId);

            const response = await axios.post(`${BASE_URL}/dashboard_v2`,
                { authcode: apiKey },
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
