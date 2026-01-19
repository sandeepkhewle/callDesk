const dashboardSummaryService = require('../services/dashboardSummaryService.js');

class DashboardSummaryController {
    /**
     * Retrieves the dashboard summary.
     */
    async getDashboardSummary(req, res, next) {
        try {
            console.log("dashboardSummary", req.body);
            const { authcode } = req.body;
            const data = await dashboardSummaryService.getDashboardSummary(authcode);
            res.success(data, 'Dashboard summary fetched successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DashboardSummaryController();
