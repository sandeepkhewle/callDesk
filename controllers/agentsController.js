const agentsService = require('../services/agentsService');
const { successResponse, errorResponse } = require('../helpers/responseHelper');

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
            const { authcode, name, phone, entity_id, user_id } = req.body;

            const data = await agentsService.createAgent({ authcode, name, phone, entity_id, user_id });

            successResponse(res, data, 201);
        } catch (error) {
            console.log(error);
            errorResponse(res, error, error.response?.status || 500, 'Failed to create agent');
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

            successResponse(res, data);
        } catch (error) {
            errorResponse(res, error, error.response?.status || 500, 'Failed to update agent');
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

            successResponse(res, data);
        } catch (error) {
            errorResponse(res, error, error.response?.status || 500, 'Failed to fetch agents');
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
            errorResponse(res, error, error.response?.status || 500, 'Failed to delete agent');
        }
    }

    /**
     * Links a DID number to an agent.
     * @param {Object} req.body - Request body
     * @param {string} req.body.authcode - Authentication code for API access (API key)
     * @param {string} req.body.name - Name of the agent
     * @param {string} req.body.did_no - DID number to link
     */
    async linkDID(req, res) {
        try {
            console.log("Linking DID to agent", req.body);
            const { authcode, did_no, member_id } = req.body;

            const data = await agentsService.linkDID({ authcode, did_no, member_id });

            successResponse(res, data);
        } catch (error) {
            console.log(error);
            errorResponse(res, error, error.response?.status || 500, 'Failed to link DID to agent');
        }
    }
}

module.exports = new AgentsController();
