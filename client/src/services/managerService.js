import api from './api.js';

/**
 * Manager Service
 * API calls for manager-specific operations
 */

const managerService = {
    /**
     * Send approved request to audit
     */
    sendToAudit: async (requestId) => {
        return await api.patch(`/manager/send-to-audit/${requestId}`);
    },
};

export default managerService;
