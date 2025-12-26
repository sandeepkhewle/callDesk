const agentsService = require('../services/agentsService');

class AgentsController {
    async createAgent(req, res) {
        try {
            console.log("Creating new member", req.body);
            const { authcode, name, phone } = req.body;

            const data = await agentsService.createAgent({ authcode, name, phone });

            res.status(201).json(data);
        } catch (error) {
            console.log(error);

            res.status(error.response?.status || 500).json({
                error: 'Failed to create agent',
                details: error.message
            });
        }
    }

    async updateAgent(req, res) {
        try {
            console.log("Updating member", req.body);

            const data = await agentsService.updateAgent(req.body);

            res.json(data);
        } catch (error) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to update agent',
                details: error.message
            });
        }
    }

    async getAgents(req, res) {
        try {
            const { authcode, page = 1, limit = 50 } = req.body;

            const data = await agentsService.getAgents({ authcode, page, limit });

            res.json(data);
        } catch (error) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to fetch agents',
                details: error.message
            });
        }
    }

    async deleteAgent(req, res) {
        try {
            const { authcode, member_id } = req.body;
            await agentsService.deleteAgent({ authcode, member_id });

            res.status(204).send();
        } catch (error) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to delete agent',
                details: error.message
            });
        }
    }
}

module.exports = new AgentsController();
