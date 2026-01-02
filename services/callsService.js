const axios = require('axios');
const { validateRequired, validateEnvironmentVars } = require('../helpers/validationHelper');

const BASE_URL = process.env.CALLERDESK_BASE_URL;
const API_KEY = process.env.CALLERDESK_API_KEY;

class CallsService {
    async clickToCall(callData) {
        try {
            // Validate required parameters
            validateRequired(callData, ['calling_party_a', 'calling_party_b', 'deskphone', 'authcode']);

            // Validate environment variables
            validateEnvironmentVars([
                { name: 'CALLERDESK_BASE_URL', value: BASE_URL },
                { name: 'CALLERDESK_API_KEY', value: API_KEY }
            ]);

            // Extract validated parameters
            const { calling_party_a, calling_party_b, deskphone, authcode } = callData;

            const response = await axios.get(`${BASE_URL}/click_to_call_v2?calling_party_a=${calling_party_a}&calling_party_b=${calling_party_b}&deskphone=${deskphone}&authcode=${authcode}&call_from_did=1`,
                {
                    headers: {
                        'Authorization': `${API_KEY}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                }
            );

            return response.data;

        } catch (error) {
            // Handle axios errors
            if (error.response) {
                // The request was made and the server responded with a status code outside 2xx
                const status = error.response.status;
                const data = error.response.data;

                if (status === 400) {
                    throw new Error(`Bad Request: ${data?.message || 'Invalid parameters provided'}`);
                } else if (status === 401) {
                    throw new Error(`Unauthorized: ${data?.message || 'Invalid API key or authentication failed'}`);
                } else if (status === 403) {
                    throw new Error(`Forbidden: ${data?.message || 'Access denied'}`);
                } else if (status === 404) {
                    throw new Error(`Not Found: ${data?.message || 'API endpoint not found'}`);
                } else if (status === 429) {
                    throw new Error(`Rate Limited: ${data?.message || 'Too many requests'}`);
                } else if (status >= 500) {
                    throw new Error(`Server Error: ${data?.message || 'Internal server error'}`);
                } else {
                    throw new Error(`API Error (${status}): ${data?.message || 'Unknown error'}`);
                }
            } else if (error.request) {
                // The request was made but no response was received
                throw new Error('Network Error: No response received from server. Please check your internet connection.');
            } else if (error.code === 'ECONNABORTED') {
                // Timeout error
                throw new Error('Request Timeout: The request took too long to complete.');
            } else {
                // Something else happened in setting up the request
                throw new Error(`Request Error: ${error.message || 'Unknown error occurred'}`);
            }
        }
    }

    async clickToCallViaCallGroup(callData) {
        try {
            // Validate required parameters
            validateRequired(callData, ['calling_party_a', 'calling_party_b', 'deskphone', 'authcode', 'group_name']);
            // Validate environment variables
            validateEnvironmentVars([
                { name: 'CALLERDESK_BASE_URL', value: BASE_URL },
                { name: 'CALLERDESK_API_KEY', value: API_KEY }
            ]);
            // Extract validated parameters
            const { calling_party_a, calling_party_b, deskphone, authcode, group_name } = callData;
            const response = await axios.get(`${BASE_URL}/click_to_call_v2?calling_party_a=${calling_party_a}&calling_party_b=${calling_party_b}&deskphone=${deskphone}&authcode=${authcode}&group_name=${group_name}&call_from_did=1`,
                {
                    headers: {
                        'Authorization': `${API_KEY}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                }
            );
            return response.data;
        } catch (error) {
            // Handle axios errors
            if (error.response) {
                // The request was made and the server responded with a status code outside 2xx
                const status = error.response.status;
                const data = error.response.data;

                if (status === 400) {
                    throw new Error(`Bad Request: ${data?.message || 'Invalid parameters provided'}`);
                } else if (status === 401) {
                    throw new Error(`Unauthorized: ${data?.message || 'Invalid API key or authentication failed'}`);
                } else if (status === 403) {
                    throw new Error(`Forbidden: ${data?.message || 'Access denied'}`);
                } else if (status === 404) {
                    throw new Error(`Not Found: ${data?.message || 'API endpoint not found'}`);
                } else if (status === 429) {
                    throw new Error(`Rate Limited: ${data?.message || 'Too many requests'}`);
                } else if (status >= 500) {
                    throw new Error(`Server Error: ${data?.message || 'Internal server error'}`);
                } else {
                    throw new Error(`API Error (${status}): ${data?.message || 'Unknown error'}`);
                }
            } else if (error.request) {
                // The request was made but no response was received
                throw new Error('Network Error: No response received from server. Please check your internet connection.');
            } else if (error.code === 'ECONNABORTED') {
                // Timeout error
                throw new Error('Request Timeout: The request took too long to complete.');
            } else {
                // Something else happened in setting up the request
                throw new Error(`Request Error: ${error.message || 'Unknown error occurred'}`);
            }
        }
    }

    async reserveClickToCall(callData) {
        try {
            // Validate required parameters
            validateRequired(callData, ['calling_party_a', 'calling_party_b', 'deskphone', 'authcode']);
            // Validate environment variables
            validateEnvironmentVars([
                { name: 'CALLERDESK_BASE_URL', value: BASE_URL },
                { name: 'CALLERDESK_API_KEY', value: API_KEY }
            ]);
            // Extract validated parameters
            const { calling_party_a, calling_party_b, deskphone, authcode } = callData;
            const response = await axios.get(`${BASE_URL}/click_to_call_v3?calling_party_a=${calling_party_a}&calling_party_b=${calling_party_b}&deskphone=${deskphone}&authcode=${authcode}&call_from_did=1`,
                { calling_party_a, calling_party_b, deskphone, authcode },
                {
                    headers: {
                        'Authorization': `${API_KEY}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                }
            );
            return response.data;
        } catch (error) {
            // Handle axios errors
            if (error.response) {
                // The request was made and the server responded with a status code outside 2xx
                const status = error.response.status;
                const data = error.response.data;
                if (status === 400) {
                    throw new Error(`Bad Request: ${data?.message || 'Invalid parameters provided'}`);
                } else if (status === 401) {
                    throw new Error(`Unauthorized: ${data?.message || 'Invalid API key or authentication failed'}`);
                } else if (status === 403) {
                    throw new Error(`Forbidden: ${data?.message || 'Access denied'}`);
                } else if (status === 404) {
                    throw new Error(`Not Found: ${data?.message || 'API endpoint not found'}`);
                } else if (status === 429) {
                    throw new Error(`Rate Limited: ${data?.message || 'Too many requests'}`);
                } else if (status >= 500) {
                    throw new Error(`Server Error: ${data?.message || 'Internal server error'}`);
                } else {
                    throw new Error(`API Error (${status}): ${data?.message || 'Unknown error'}`);
                }
            } else if (error.request) {
                // The request was made but no response was received
                throw new Error('Network Error: No response received from server. Please check your internet connection.');
            } else if (error.code === 'ECONNABORTED') {
                // Timeout error
                throw new Error('Request Timeout: The request took too long to complete.');
            } else {
                // Something else happened in setting up the request
                throw new Error(`Request Error: ${error.message || 'Unknown error occurred'}`);
            }
        }
    }

    async callReport(authcode) {
        const response = await axios.post(`${BASE_URL}/call_list_v2`,
            { authcode },
            {
                headers: {
                    'Authorization': `${API_KEY}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data;
    }

    async getIvrNumbersList(authcode) {
        const response = await axios.post(`${BASE_URL}/getdeskphone_v2`,
            { authcode },
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

module.exports = new CallsService();
