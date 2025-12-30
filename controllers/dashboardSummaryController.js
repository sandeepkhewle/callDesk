const dashboardSummaryService = require('../services/dashboardSummaryService.js');

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
            res.json(data);
        } catch (error) {
            if (error.message === 'Authcode is required') {
                res.status(400).json({
                    error: 'Bad Request',
                    details: error.message
                });
            } else {
                res.status(error.response?.status || 500).json({
                    error: 'Failed to fetch dashboard summary',
                    details: error.message
                });
            }
        }
    }
}

module.exports = new dashboardSummaryController();
