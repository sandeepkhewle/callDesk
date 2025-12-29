const agentsService = require('../services/agentsService');

class AgentsController {
    /**
     * Creates a new agent.
     * @param {Object} req.body - Request body
     * @param {string} req.body.authcode - Authentication code for API access (API key)
     * @param {string} req.body.name - Name of the agent
     * @param {string} req.body.phone - Phone number of the agent
     */
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

    /**
     * Updates an existing agent.
     * @param {Object} req.body - Request body (full body passed to service)
     */
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

    /**
     * Retrieves a list of agents.
     * @param {Object} req.body - Request body
     * @param {string} req.body.authcode - Authentication code for API access (API key)
     * @param {number} [req.body.page=1] - Page number for pagination
     * @param {number} [req.body.limit=50] - Number of agents per page
     */
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

    /**
     * Deletes an agent.
     * @param {Object} req.body - Request body
     * @param {string} req.body.authcode - Authentication code for API access (API key)
     * @param {string} req.body.member_id - ID of the agent to delete
     */
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
