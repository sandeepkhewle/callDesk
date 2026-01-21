const agentsService = require('../services/agentsService');

class AgentsController {
    /**
     * Creates a new agent.
     */
    async createAgent(req, res, next) {
        try {
            const data = await agentsService.createAgent(req.body);
            res.success(data, 'Agent created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Creates a new agent with reuse logic (V2).
     * Checks if agent exists by employee_id and entity_id, reuses if found.
     */
    async createAgentV2(req, res, next) {
        try {
            const data = await agentsService.createAgentV2(req.body);
            res.success(data, 'Agent created/updated successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validates agent creation data
     */
    async validateAgentCreation(req, res, next) {
        try {
            const data = await agentsService.validateAgentCreation(req.body);
            if (data.success) {
                res.success(data, 'Validation successful');
            } else {
                // If service returns logical failure, strictly speaking it's a 409 or 400
                res.error(data.message, 409);
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Updates an existing agent.
     */
    async updateAgent(req, res, next) {
        try {
            const data = await agentsService.updateAgent(req.body);
            res.success(data, 'Agent updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retrieves a list of agents.
     */
    async getAgents(req, res, next) {
        try {
            const { page, limit, entityId } = req.body; // Validation middleware handles defaults/types
            const data = await agentsService.getAgents({ page, limit, entityId });
            res.success(data, 'Agents fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Deletes an agent.
     */
    async deleteAgent(req, res, next) {
        try {
            await agentsService.deleteAgent(req.body);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    /**
     * Links a DID number to an agent.
     */
    async linkDID(req, res, next) {
        try {
            const data = await agentsService.linkDID(req.body);
            res.success(data, 'DID linked successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Synchronizes agents for an entity.
     */
    async syncAgents(req, res, next) {
        try {
            const { entityId } = req.params;
            const data = await agentsService.syncAgents(entityId);
            res.success(data, 'Agents synchronized successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AgentsController();
