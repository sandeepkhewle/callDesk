const callGroupsService = require('../services/callGroupsService');
const { successResponse, errorResponse } = require('../helpers/responseHelper');

class CallGroupsController {
    /**
     * Creates a new call group.
     * @param {Object} req.body - Request body
     * @param {string} req.body.authcode - Authentication code for API access (API key)
     * @param {string} req.body.name - Name of the call group
     * @param {string} req.body.deskphone_id - ID of the deskphone associated with the group
     */
    async createCallGroup(req, res) {
        try {
            console.log("Creating new call group", req.body);
            const { authcode, name, deskphone_id } = req.body;

            const data = await callGroupsService.createCallGroup({ authcode, name, deskphone_id });

            successResponse(res, data, 201);
        } catch (error) {
            console.log(error);
            errorResponse(res, error, error.response?.status || 500, 'Failed to create call group');
        }
    }

    /**
     * Updates an existing call group.
     * @param {Object} req.body - Request body (full body passed to service)
     */
    async updateCallGroup(req, res) {
        try {
            console.log("Updating call group", req.body);

            const data = await callGroupsService.updateCallGroup(req.body);
            successResponse(res, data);
        } catch (error) {
            errorResponse(res, error, error.response?.status || 500, 'Failed to update call group');
        }
    }

    /**
     * Retrieves a list of call groups.
     * @param {Object} req.body - Request body
     * @param {string} req.body.authcode - Authentication code for API access (API key)
     * @param {number} [req.body.page=1] - Page number for pagination
     * @param {number} [req.body.limit=50] - Number of call groups per page
     */
    async getCallGroups(req, res) {
        try {
            const { authcode, page = 1, limit = 50 } = req.body;

            const data = await callGroupsService.getCallGroups({ authcode, page, limit });
            successResponse(res, data);
        } catch (error) {
            errorResponse(res, error, error.response?.status || 500, 'Failed to fetch call groups');
        }
    }

    /**
     * Deletes a call group.
     * @param {Object} req.body - Request body
     * @param {string} req.body.authcode - Authentication code for API access (API key)
     * @param {string} req.body.group_id - ID of the call group to delete
     */
    async deleteCallGroup(req, res) {
        try {
            const { authcode, group_id } = req.body;
            await callGroupsService.deleteCallGroup({ authcode, group_id });

            res.status(204).send();
        } catch (error) {
            errorResponse(res, error, error.response?.status || 500, 'Failed to delete call group');
        }
    }
}

module.exports = new CallGroupsController();
