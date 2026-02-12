import api from './api';

/**
 * Request service for change request operations
 */
const requestService = {
    /**
     * Get all requests (filtered by role on backend)
     */
    getAll: async (params = {}) => {
        const response = await api.get('/requests', { params });
        return response; // returns { success, data, pagination }
    },

    /**
     * Get single request by ID
     */
    getById: async (id) => {
        const response = await api.get(`/requests/${id}`);
        return response;
    },

    /**
     * Create new request
     */
    create: async (requestData) => {
        const response = await api.post('/requests', requestData);
        return response;
    },

    /**
     * Update existing request
     */
    update: async (id, requestData) => {
        const response = await api.put(`/requests/${id}`, requestData);
        return response;
    },

    /**
     * Approve request (Manager/Admin only)
     */
    approve: async (id) => {
        const response = await api.patch(`/requests/${id}/approve`);
        return response;
    },

    /**
     * Reject request (Manager/Admin only)
     */
    reject: async (id, rejectionReason) => {
        const response = await api.patch(`/requests/${id}/reject`, { rejectionReason });
        return response;
    },

    /**
     * Delete request (Admin only)
     */
    delete: async (id) => {
        const response = await api.delete(`/requests/${id}`);
        return response;
    },

    /**
     * Get request statistics
     */
    getStats: async () => {
        const response = await api.get('/requests/stats');
        return response;
    },

    /**
     * Upload file attachment
     */
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    },
};

export default requestService;
