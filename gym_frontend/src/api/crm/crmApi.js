import apiClient from '../apiClient';

export const crmApi = {
    // Leads
    createLead: async (leadData) => {
        try {
            const response = await apiClient.post('/crm/leads', leadData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getLeads: async (params = {}) => {
        try {
            const response = await apiClient.get('/crm/leads', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateLeadStatus: async (id, status) => {
        try {
            const response = await apiClient.patch(`/crm/leads/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Follow-ups
    getTodayFollowUps: async () => {
        try {
            const response = await apiClient.get('/crm/followups/today');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    addFollowUp: async (leadId, data) => {
        try {
            const response = await apiClient.post(`/crm/leads/${leadId}/followups`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
