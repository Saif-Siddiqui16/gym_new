import apiClient from './apiClient';

export const promoApi = {
    getAllPromos: async () => {
        try {
            const response = await apiClient.get('/promos');
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch promos';
        }
    },

    createPromo: async (data) => {
        try {
            const response = await apiClient.post('/promos', data);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to create promo';
        }
    },

    updatePromo: async (id, data) => {
        try {
            const response = await apiClient.put(`/promos/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update promo';
        }
    },

    deletePromo: async (id) => {
        try {
            const response = await apiClient.delete(`/promos/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to delete promo';
        }
    },

    validatePromo: async (code) => {
        try {
            const response = await apiClient.get(`/promos/validate/${code}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to validate promo code';
        }
    }
};
