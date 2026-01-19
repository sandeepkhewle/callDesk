const callGroupsService = require('../services/callGroupsService');

class CallGroupsController {
    /**
     * Creates a new call group.
     */
    async createCallGroup(req, res, next) {
        try {
            console.log("Creating new call group", req.body);
            const data = await callGroupsService.createCallGroup(req.body);
            res.success(data, 'Call group created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Updates an existing call group.
     */
    async updateCallGroup(req, res, next) {
        try {
            console.log("Updating call group", req.body);
            const data = await callGroupsService.updateCallGroup(req.body);
            res.success(data, 'Call group updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retrieves a list of call groups.
     */
    async getCallGroups(req, res, next) {
        try {
            const { authcode, page, limit } = req.body;
            const data = await callGroupsService.getCallGroups({ authcode, page, limit });
            res.success(data, 'Call groups fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Deletes a call group.
     */
    async deleteCallGroup(req, res, next) {
        try {
            await callGroupsService.deleteCallGroup(req.body);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CallGroupsController();
