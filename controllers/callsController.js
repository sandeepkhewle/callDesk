const callsService = require('../services/callsService');
const { successResponse, errorResponse } = require('../helpers/responseHelper');

class CallsController {
    /**
     * Initiates a click-to-call.
     * @param {Object} req.body - Request body
     * @param {string} req.body.calling_party_a - Phone number of the caller (agent)
     * @param {string} req.body.calling_party_b - Phone number of the receiver
     * @param {string} req.body.deskphone - Agent's deskphone number
     * @param {string} req.body.authcode - Authentication code for API access (API key)
     */
    async clickToCall(req, res) {
        try {
            console.log("/clickToCall", req.body);

            //calling_party_a is the caller(agent) number
            //calling_party_b is the receiver number
            //deskphone is the agent deskphone number
            const { calling_party_a, calling_party_b, deskphone, authcode } = req.body;

            const data = await callsService.clickToCall({ calling_party_a, calling_party_b, deskphone, authcode });

            successResponse(res, data);
        } catch (error) {
            errorResponse(res, error, 500, 'Failed to initiate click to call');
        }
    }

    /**
     * Initiates a click-to-call via a call group.
     * @param {Object} req.body - Request body
     * @param {string} req.body.calling_party_a - Phone number of the caller (agent)
     * @param {string} req.body.calling_party_b - Phone number of the receiver
     * @param {string} req.body.deskphone - Agent's deskphone number
     * @param {string} req.body.authcode - Authentication code for API access (API key)
     * @param {string} req.body.group_name - Name of the call group
     */
    async clickToCallViaCallGroup(req, res) {
        try {
            console.log("/clickToCallViaCallGroup", req.body);

            //calling_party_a is the caller(agent) number
            //calling_party_b is the receiver number
            //deskphone is the agent deskphone number
            //authcode is the authentication code
            //group_name is the name of the call group
            const { calling_party_a, calling_party_b, deskphone, authcode, group_name } = req.body;

            const data = await callsService.clickToCallViaCallGroup({ calling_party_a, calling_party_b, deskphone, authcode, group_name });

            successResponse(res, data);
        } catch (error) {
            errorResponse(res, error, 500, 'Failed to initiate click to call via call group');
        }
    }

    /**
     * Initiates a click-to-call.
     * @param {Object} req.body - Request body
     * @param {string} req.body.calling_party_a - Phone number of the receiver
     * @param {string} req.body.calling_party_b - Phone number of the caller (agent)
     * @param {string} req.body.deskphone - Agent's deskphone number
     * @param {string} req.body.authcode - Authentication code for API access (API key)
     */
    async reserveClickToCall(req, res) {
        try {
            console.log("/reserveClickToCall", req.body);

            //calling_party_a is the Receiver's number
            //calling_party_b is the caller(agent) number
            //deskphone is the agent deskphone number
            //authcode is the authentication code
            const { calling_party_a, calling_party_b, deskphone, authcode } = req.body;

            const data = await callsService.reserveClickToCall({ calling_party_a, calling_party_b, deskphone, authcode });
            successResponse(res, data);
        } catch (error) {
            errorResponse(res, error, 500, 'Failed to reserve click to call');
        }
    }

    /**
     * Retrieves call reports.
     * @param {Object} req.body - Request body
     * @param {string} req.body.authcode - Authentication code for API access (API key)
     */
    async callReports(req, res) {
        try {
            console.log("calls reports", req.body);

            const { authcode } = req.body;

            const data = await callsService.callReport(authcode);

            successResponse(res, data);
        } catch (error) {
            errorResponse(res, error, error.response?.status || 500, 'Failed to fetch call reports');
        }
    }

    /**
     * Retrieves the list of IVR numbers.
     * @param {Object} req.body - Request body
     * @param {string} req.body.authcode - Authentication code for API access (API key)
     */
    async getIvrNumbersList(req, res) {
        try {
            const { authcode } = req.body;

            const data = await callsService.getIvrNumbersList(authcode);

            successResponse(res, data);
        } catch (error) {
            errorResponse(res, error, error.response?.status || 500, 'Failed to fetch IVR number list');
        }
    }
}

module.exports = new CallsController();
