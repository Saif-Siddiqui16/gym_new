import apiClient from './apiClient';

export const lockerApi = {
    getAllLockers: async () => {
        const response = await apiClient.get('/lockers');
        return response.data;
    },

    assignLocker: async (id, memberData) => {
        const response = await apiClient.patch(`/lockers/${id}/assign`, memberData);
        return response.data;
    },

    releaseLocker: async (id) => {
        const response = await apiClient.patch(`/lockers/${id}/release`);
        return response.data;
    },

    addLocker: async (data) => {
        const response = await apiClient.post('/lockers', data);
        return response.data;
    },

    deleteLocker: async (id) => {
        const response = await apiClient.delete(`/lockers/${id}`);
        return response.data;
    }
};
