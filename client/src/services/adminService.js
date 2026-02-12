import api from './api';

/**
 * Admin service for administrative operations
 */
const adminService = {
    /**
     * Get all users
     */
    getUsers: async (params = {}) => {
        const response = await api.get('/admin/users', { params });
        return response;
    },

    /**
     * Create new user
     */
    createUser: async (userData) => {
        const response = await api.post('/admin/users', userData);
        return response;
    },

    /**
     * Update user
     */
    updateUser: async (id, userData) => {
        const response = await api.patch(`/admin/users/${id}`, userData);
        return response;
    },

    /**
     * Delete user
     */
    deleteUser: async (id) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response;
    },

    /**
     * Get system analytics
     */
    getAnalytics: async () => {
        const response = await api.get('/admin/analytics');
        return response;
    },

    /**
     * Get audit logs
     */
    getAuditLogs: async (params = {}) => {
        const response = await api.get('/admin/audit-logs', { params });
        return response;
    },

    /**
     * Export audit logs to CSV
     */
    exportAuditLogs: async (params = {}) => {
        const response = await api.get('/admin/audit-logs/export', {
            params,
            responseType: 'blob',
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit-logs-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return response;
    },
};

export default adminService;
