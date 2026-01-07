const dashboardSummaryService = require('../services/dashboardSummaryService.js');
const { successResponse, errorResponse } = require('../helpers/responseHelper');

class dashboardSummaryController {
    /**
     * Retrieves the dashboard summary.
     * @param {Object} req.body - Request body
     * @param {string} req.body.authcode - Authentication code for API access (API key)
     */
    async getDashboardSummary(req, res) {
        try {
            console.log("dashboardSummary", req.body);
            const { authcode } = req.body;
            const data = await dashboardSummaryService.getDashboardSummary(authcode);
            successResponse(res, data);
        } catch (error) {
            const status = error.message === 'Authcode is required' ? 400 : error.response?.status || 500;
            const message = error.message === 'Authcode is required' ? 'Bad Request' : 'Failed to fetch dashboard summary';
            errorResponse(res, error, status, message);
        }
    }
}

module.exports = new dashboardSummaryController();
