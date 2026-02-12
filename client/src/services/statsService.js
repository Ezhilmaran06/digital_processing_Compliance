import api from './api';

/**
 * Statistics service for analytics data fetching
 */
const statsService = {
    /**
     * Get request statistics
     */
    getRequestStats: async () => {
        const response = await api.get('/requests/stats');
        return response;
    },
};

export default statsService;
