import api from './api';

/**
 * Authentication service
 */
const authService = {
    /**
     * Register a new user
     */
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.success && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response;
    },

    /**
     * Login user with role validation
     */
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.success && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response;
    },

    /**
     * Logout user
     */
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    /**
     * Get current user profile
     */
    getProfile: async () => {
        const response = await api.get('/auth/me');
        return response;
    },

    /**
     * Update user profile
     */
    updateProfile: async (userData) => {
        const response = await api.patch('/auth/me', userData);
        if (response.success) {
            const currentUser = authService.getCurrentUser();
            const updatedUser = { ...currentUser, ...response.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        }
        return response.data;
    },

    /**
     * Update password
     */
    updatePassword: async (passwordData) => {
        const response = await api.patch('/auth/update-password', passwordData);
        return response;
    },

    /**
     * Upload user avatar
     */
    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        // 1. Upload the file to get the filename
        const uploadResponse = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (uploadResponse.success) {
            const avatarPath = `/uploads/${uploadResponse.data.filename}`;
            // 2. Update user profile with the new avatar path
            const profileResponse = await api.patch('/auth/avatar', { avatar: avatarPath });

            if (profileResponse.success) {
                const currentUser = authService.getCurrentUser();
                const updatedUser = { ...currentUser, avatar: avatarPath };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                return updatedUser;
            }
        }
        throw new Error('Failed to upload avatar');
    },

    /**
     * Get current user from localStorage
     */
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

export default authService;
