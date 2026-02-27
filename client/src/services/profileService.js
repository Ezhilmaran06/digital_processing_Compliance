import api from './api';

const profileService = {
    /**
     * Get current user profile with computed stats
     */
    getProfile: async () => {
        const response = await api.get('/profile');
        return response;
    },

    /**
     * Update profile (name & department only)
     */
    updateProfile: async (data) => {
        const response = await api.put('/profile/update', data);
        return response;
    },

    /**
     * Change password
     */
    changePassword: async (data) => {
        const response = await api.put('/profile/change-password', data);
        return response;
    },

    /**
     * Toggle two-factor authentication
     */
    toggle2FA: async () => {
        const response = await api.put('/profile/toggle-2fa');
        return response;
    },
};

export default profileService;
