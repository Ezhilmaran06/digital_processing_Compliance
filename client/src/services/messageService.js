import api from './api';

const messageService = {
    /**
     * Get all messages for the current user (inbox)
     */
    getMessages: async () => {
        const response = await api.get('/messages');
        return response;
    },

    /**
     * Get the count of unread messages for the current user
     */
    getUnreadCount: async () => {
        const response = await api.get('/messages/unread');
        return response;
    },

    /**
     * Mark a specific message as read
     */
    markAsRead: async (id) => {
        const response = await api.patch(`/messages/${id}/read`);
        return response;
    },

    /**
     * Get available recipients (managers only)
     */
    getRecipients: async () => {
        const response = await api.get('/messages/users');
        return response;
    },

    /**
     * Send a new message to a specific user or group
     */
    sendMessage: async (receiverId, groupId, message) => {
        const payload = { message };
        if (receiverId) payload.receiverId = receiverId;
        if (groupId) payload.groupId = groupId;
        const response = await api.post('/messages', payload);
        return response;
    },
};

export default messageService;
