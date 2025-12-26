const callGroupsService = require('../services/callGroupsService');

class CallGroupsController {
    async createCallGroup(req, res) {
        try {
            console.log("Creating new call group", req.body);
            const { authcode, name, phone } = req.body;

            const data = await callGroupsService.createCallGroup({ authcode, name, phone });

            res.status(201).json(data);
        } catch (error) {
            console.log(error);

            res.status(error.response?.status || 500).json({
                error: 'Failed to create call group',
                details: error.message
            });
        }
    }

    async updateCallGroup(req, res) {
        try {
            console.log("Updating call group", req.body);

            const data = await callGroupsService.updateCallGroup(req.body);
            res.json(data);
        } catch (error) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to update call group',
                details: error.message
            });
        }
    }

    async getCallGroups(req, res) {
        try {
            const { authcode, page = 1, limit = 50 } = req.body;

            const data = await callGroupsService.getCallGroups({ authcode, page, limit });
            res.json(data);
        } catch (error) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to fetch call groups',
                details: error.message
            });
        }
    }

    async deleteCallGroup(req, res) {
        try {
            const { authcode, member_id } = req.body;
            await callGroupsService.deleteCallGroup({ authcode, member_id });

            res.status(204).send();
        } catch (error) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to delete call group',
                details: error.message
            });
        }
    }
}

module.exports = new CallGroupsController();
