import apiClient from './apiClient';

const amenityApi = {
    getAll: async () => {
        try {
            const response = await apiClient.get('/amenities');
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch amenities';
        }
    },
    create: async (data) => {
        try {
            const response = await apiClient.post('/amenities', data);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to create amenity';
        }
    },
    update: async (id, data) => {
        try {
            const response = await apiClient.patch(`/amenities/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update amenity';
        }
    },
    delete: async (id) => {
        try {
            const response = await apiClient.delete(`/amenities/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to delete amenity';
        }
    }
};

export default amenityApi;
