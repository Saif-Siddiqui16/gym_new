import apiClient from '../apiClient';

export const getCommStats = async (branchId = null) => {
    try {
        const response = await apiClient.get('/communication/stats', {
            params: { branchId }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch communication stats';
    }
};

export const getAnnouncements = async (branchId = null) => {
    try {
        const response = await apiClient.get('/communication/announcements', {
            params: { branchId }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch announcements';
    }
};

export const createAnnouncement = async (data) => {
    try {
        const response = await apiClient.post('/communication/announcements', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to create announcement';
    }
};

export const getTemplates = async (branchId = null, channel = null) => {
    try {
        const response = await apiClient.get('/communication/templates', {
            params: { branchId, channel }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch templates';
    }
};

export const createTemplate = async (data) => {
    try {
        const response = await apiClient.post('/communication/templates', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to create template';
    }
};

export const deleteTemplate = async (id) => {
    try {
        const response = await apiClient.delete(`/communication/templates/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to delete template';
    }
};

export const sendBroadcast = async (data) => {
    try {
        const response = await apiClient.post('/communication/broadcast', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to send broadcast';
    }
};

export const getCommLogs = async (branchId = null) => {
    try {
        const response = await apiClient.get('/communication/logs', {
            params: { branchId }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch communication logs';
    }
};

export const getChatContacts = async () => {
    try {
        const response = await apiClient.get('/communication/contacts');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch chat contacts';
    }
};

export const getChatMessages = async (contactId, isMemberId = false) => {
    try {
        const response = await apiClient.get(`/communication/messages/${contactId}`, {
            params: { isMemberId }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch chat messages';
    }
};

export const sendChatMessage = async (data) => {
    try {
        const response = await apiClient.post('/communication/messages', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to send chat message';
    }
};

// Aliases for backward compatibility with other components
export const addAnnouncement = createAnnouncement;
export const fetchAnnouncements = getAnnouncements;
export const sendBroadcastMessage = sendBroadcast;
export const fetchCommLogs = getCommLogs;
export const fetchCommStats = getCommStats;
export const fetchMessageTemplates = getTemplates;
export const fetchChatContacts = getChatContacts;
export const fetchAnnouncement = getAnnouncements; // Single/Plural insurance
