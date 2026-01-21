const axios = require('axios');
const Agent = require('../models/agent.model');
const Entity = require('../models/entity.model');
const IVR = require('../models/ivr.model');
const apiKeyService = require('./apiKeyService');
const mongoose = require('mongoose');

class AgentsService {

    constructor() {
        this.BASE_URL = process.env.CALLERDESK_BASE_URL;
    }

    async _getKeyByEntityId(entityId) {
        return await apiKeyService.getDecryptedKey(entityId);
    }

    async _getKeyByAuthCode(authcode) {
        if (!authcode) throw new Error("Authcode required");
        const entity = await Entity.findOne({ authcode });
        if (!entity) throw new Error("Entity not found for authcode");
        return await apiKeyService.getDecryptedKey(entity._id);
    }

    /**
     * Resolves API Key by finding the agent and its associated entity
     * @param {string} member_id 
     */
    async _getKeyByMemberId(member_id) {
        const agent = await Agent.findOne({ user_id: member_id });
        if (!agent) throw new Error("Agent not found locally");
        return await apiKeyService.getDecryptedKey(agent.entity);
    }

    async createAgent(agentData) {
        const { name, phone, entity_id } = agentData;

        // Dynamic Key Lookup
        const apiKey = await this._getKeyByEntityId(entity_id);



        const response = await axios.post(`${this.BASE_URL}/addmember_v2`, {
            authcode: apiKey, // Use the dynamic key as authcode payload if required by API logic, OR just header?
            // Original code sent `authcode: this.API_KEY` in body AND header.
            // We will send dynamic key in both to match legacy behavior.
            member_name: name,
            member_num: phone,
            access: 2,
            active: 1
        }, {
            headers: {
                'Authorization': `${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Save to local database only after successful API call and getting member_id
        const agent = new Agent({

            entity: entity_id,
            user_id: response.data?.getmember[0]?.member_id,
            name,
            phone,
            access: 2,
            active: 1
        });

        await agent.save();

        return response.data;
    }

    async createAgentV2(agentData) {
        const { name, phone, entity_id, employee_id, deskphone } = agentData;

        // Dynamic Key Lookup
        const apiKey = await this._getKeyByEntityId(entity_id);


        // const validation = await this.validateAgentCreation({ entity_id, deskphone });
        // if (!validation.success) {
        //     throw new Error(validation.message);
        // }

        const ivrSyncService = require('./ivrSyncService');
        await ivrSyncService.syncIvrsForEntity(entity_id);

        const agents = await Agent.findOne({ entity: entity_id, employee_id: employee_id });
        if (agents) {
            const agent = await this.updateAgent({ member_id: agents.user_id, member_name: name, member_num: phone, access: 2, active: 1 });
            if (deskphone) {
                agents.deskphone = deskphone;
                await agents.save();
            }
            return agents;
        } else {
            // const response = await axios.post(`${this.BASE_URL}/addmember_v2`, {
            //     authcode: apiKey, // Use the dynamic key as authcode payload if required by API logic, OR just header?
            //     // Original code sent `authcode: this.API_KEY` in body AND header.
            //     // We will send dynamic key in both to match legacy behavior.
            //     member_name: name,
            //     member_num: phone,
            //     access: 2,
            //     active: 1
            // }, {
            //     headers: {
            //         'Authorization': `${apiKey}`,
            //         'Content-Type': 'application/x-www-form-urlencoded'
            //     }
            // }).catch((error) => {
            //     console.error('Error adding member:', error);
            //     throw error;
            // });

            // if (!response.data?.type == 'error') {
            //     throw new Error(response.data?.message);
            // }

            // Save to local database only after successful API call and getting member_id
            const agent = new Agent({
                deskphone: deskphone,
                entity: entity_id,
                user_id: "60610",
                name,
                phone,
                access: 2,
                active: 1,
                employee_id
            });

            await agent.save();
            return agent;
        }

    }

    async validateAgentCreation(agentData) {
        const { entity_id, deskphone } = agentData;

        // Check if entity exists
        const entity = await Entity.findById(entity_id);
        if (!entity) {
            return {
                success: false,
                message: 'Entity not found'
            };
        }

        // Check if deskphone is already linked to another agent in the same entity
        if (deskphone) {
            const existingAgent = await Agent.findOne({
                entity: entity_id,
                deskphone: deskphone
            });

            if (existingAgent) {
                return {
                    success: false,
                    message: `Deskphone number ${deskphone} is already linked to another agent`,
                    linkedAgent: existingAgent
                };
            }
        }

        return {
            success: true,
            message: 'Validation passed'
        };
    }

    async updateAgent(agentData) {
        const { member_id, member_name, member_num } = agentData;

        // Dynamic Key Lookup via Member ID
        const apiKey = await this._getKeyByMemberId(member_id);

        const response = await axios.post(`${this.BASE_URL}/updatemember_v2`, agentData, {
            headers: {
                'Authorization': `${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Update local database
        await Agent.findOneAndUpdate(
            { user_id: member_id },
            { name: member_name, phone: member_num, }
        );

        return response.data;
    }

    async getAgents({ page = 1, limit = 50, entityId }) {
        // Require entityId to identify context
        const apiKey = await this._getKeyByEntityId(entityId);

        const response = await axios.post(`${this.BASE_URL}/getmemberlist_V2`, { authcode: apiKey }, {
            headers: {
                'Authorization': `${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: { current_page: page, per_page: limit }
        });

        // Sync logic: Ensure fetched agents are consistent with local DB
        // Note: This only syncs the current PAGE. For full sync, use syncAgents()
        if (response.data && response.data.getmember) {
            const apiAgents = response.data.getmember;

            for (const apiAgent of apiAgents) {
                await Agent.findOneAndUpdate(
                    { user_id: apiAgent.member_id },
                    {
                        entity: entityId,
                        name: apiAgent.member_name,
                        phone: apiAgent.member_num,
                        active: apiAgent.active || 1, // Default to active if missing
                        // Preserve local fields like deskphone if they exist, or valid updates?
                        // We strictly update name/phone from API as source of truth.
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                ).exec();
            }
        }

        return response.data;
    }

    /**
     * Fully synchronizes local agent database with 3rd party API for a given entity.
     * Fetches ALL agents from API and reconciles.
     * @param {string} entityId 
     */
    async syncAgents(entityId) {
        const apiKey = await this._getKeyByEntityId(entityId);

        let allApiAgents = [];
        let page = 1;
        let hasMore = true;

        // 1. Fetch ALL agents from API
        while (hasMore) {
            try {
                const response = await axios.post(`${this.BASE_URL}/getmemberlist_V2`, { authcode: apiKey }, {
                    headers: {
                        'Authorization': `${apiKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    params: { current_page: page, per_page: 100 } // Use large limit for efficiency
                });

                const agents = response.data?.getmember || [];
                if (agents.length === 0) {
                    hasMore = false;
                } else {
                    allApiAgents = allApiAgents.concat(agents);
                    // Check if we reached the last page (heuristic or API flag?)
                    // Assuming if we got less than requested, it's the end.
                    if (agents.length < 100) {
                        hasMore = false;
                    } else {
                        page++;
                    }
                }
            } catch (err) {
                console.error(`Error fetching page ${page} for sync:`, err.message);
                hasMore = false; // Abort on error to avoid infinite loops
            }
        }

        const apiAgentIds = new Set(allApiAgents.map(a => a.member_id));

        // 2. Upsert (Create/Update) all API agents to Local DB
        const updatePromises = allApiAgents.map(apiAgent => {
            return Agent.findOneAndUpdate(
                { user_id: apiAgent.member_id },
                {
                    entity: entityId,
                    name: apiAgent.member_name,
                    phone: apiAgent.member_num,
                    active: apiAgent.active || 1,
                    // If creating new, generate a random agent_id if required by schema uniqueness?
                    // Schema says agent_id is required and unique.
                    // If we rely on default, we might need to provide it in setDefaultsOnInsert or handle it here.
                    // Attempt to set agent_id only on insert is tricky with findOneAndUpdate.
                    // Let's use bulkWrite or separate ops if needed.
                    // For now, let's use a simple approach: logic inside setter or pre-save? 
                    // findOneAndUpdate with upsert won't run mongoose middleware for defaults effectively if not configured.
                    // We'll add `agent_id` to the update payload using $setOnInsert.
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                    rawResult: true
                }
            ).then(async (result) => {
                // If it was inserted and agent_id is missing/null (because $setOnInsert didn't have it?), fix it.
                // Actually, let's just generate one.
                if (result.lastErrorObject?.updatedExisting === false) {
                    // It was a new doc. Ensure agent_id is set if schema defaults didn't catch it.
                    // But we can't easily check 'doc' here with rawResult alone for content.
                    // Better strategy: Use explicit operations.
                }
            });
        });

        // Revised Strategy for Upsert to handle `agent_id` generation for new docs:
        for (const apiAgent of allApiAgents) {
            const existing = await Agent.findOne({ user_id: apiAgent.member_id });
            if (existing) {
                existing.name = apiAgent.member_name;
                existing.phone = apiAgent.member_num;
                existing.active = apiAgent.active || 1;
                await existing.save();
            } else {
                const newAgent = new Agent({
                    entity: entityId,
                    user_id: apiAgent.member_id,
                    name: apiAgent.member_name,
                    phone: apiAgent.member_num,
                    active: apiAgent.active || 1,
                    active: apiAgent.active || 1,
                });
                await newAgent.save();
            }
        }

        // 3. Remove Local Agents not in API List (Cleanup)
        // Only delete agents belonging to THIS entity that are NOT in apiAgentIds
        const deleteResult = await Agent.deleteMany({
            entity: entityId,
            user_id: { $nin: Array.from(apiAgentIds) }
        });

        return {
            totalSynced: allApiAgents.length,
            deletedLocal: deleteResult.deletedCount
        };
    }

    async deleteAgent(agentData) {
        const { member_id } = agentData;

        const apiKey = await this._getKeyByMemberId(member_id);

        const response = await axios.post(`${this.BASE_URL}/deletemember_v2`,
            { authcode: apiKey, member_id },
            {
                headers: {
                    'Authorization': `${apiKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        //delete agent from local database
        await Agent.deleteOne({ user_id: member_id });

        return response.data;
    }

    async linkDID(agentData) {
        const { deskphone, member_id } = agentData;

        // Check if the deskphone is a valid IVR for this entity
        const agent = await Agent.findOne({ user_id: member_id });
        if (!agent) throw new Error('Agent not found');

        const ivrSyncService = require('./ivrSyncService');
        const ivrRecord = await ivrSyncService.validateIVRForEntity(deskphone, agent.entity);

        if (!ivrRecord) {
            throw new Error(`Cannot assign deskphone ${deskphone}. It is not a registered IVR for the agent's entity.`);
        }

        // Find agent by member_id, then update deskphone
        const updatedAgent = await Agent.findOneAndUpdate(
            { user_id: member_id },
            { deskphone, updatedAt: new Date() },
            { new: true }
        );

        return updatedAgent;
    }
}

module.exports = new AgentsService();
