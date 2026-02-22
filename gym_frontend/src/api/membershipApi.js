import apiClient from './apiClient';

export const membershipApi = {
    // Get all members with optional filters
    getMembers: async (params = {}) => {
        try {
            const response = await apiClient.get('/admin/members', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get single member details
    getMemberById: async (id) => {
        try {
            const response = await apiClient.get(`/admin/members/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Add new member
    createMember: async (memberData) => {
        try {
            const response = await apiClient.post('/admin/members', memberData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update member
    updateMember: async (id, memberData) => {
        try {
            const response = await apiClient.patch(`/admin/members/${id}`, memberData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Toggle status
    toggleStatus: async (id) => {
        try {
            const response = await apiClient.patch(`/admin/members/${id}/toggle-status`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    freezeMember: async (id, data) => {
        try {
            const response = await apiClient.patch(`/admin/members/${id}/freeze`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    unfreezeMember: async (id) => {
        try {
            const response = await apiClient.patch(`/admin/members/${id}/unfreeze`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    giftDays: async (id, data) => {
        try {
            const response = await apiClient.patch(`/admin/members/${id}/gift`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // --- Membership Plans ---
    getPlans: async () => {
        try {
            const response = await apiClient.get('/admin/plans');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createPlan: async (planData) => {
        try {
            const response = await apiClient.post('/admin/plans', planData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updatePlan: async (id, planData) => {
        try {
            const response = await apiClient.patch(`/admin/plans/${id}`, planData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deletePlan: async (id) => {
        try {
            const response = await apiClient.delete(`/admin/plans/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
