const callsService = require('../services/callsService');

class CallsController {
    /**
     * Initiates a click-to-call.
     */
    async clickToCall(req, res, next) {
        try {
            console.log("/clickToCall", req.body);
            const data = await callsService.clickToCall(req.body);
            res.success(data, 'Call initiated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Initiates a click-to-call via a call group.
     */
    async clickToCallViaCallGroup(req, res, next) {
        try {
            console.log("/clickToCallViaCallGroup", req.body);
            const data = await callsService.clickToCallViaCallGroup(req.body);
            res.success(data, 'Group call initiated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Initiates a click-to-call (Reverse).
     */
    async reserveClickToCall(req, res, next) {
        try {
            console.log("/reserveClickToCall", req.body);
            const data = await callsService.reserveClickToCall(req.body);
            res.success(data, 'Reserve ID call initiated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retrieves call reports.
     */
    async callReports(req, res, next) {
        try {
            const { entityId } = req.body;
            const data = await callsService.callReport(entityId);
            res.success(data, 'Call reports fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retrieves the list of IVR numbers.
     */
    async getIvrNumbersList(req, res, next) {
        try {
            const { entityId } = req.body;
            const data = await callsService.getIvrNumbersList(entityId);
            res.success(data, 'IVR numbers fetched successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CallsController();
