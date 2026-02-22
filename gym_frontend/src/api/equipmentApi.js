import apiClient from './apiClient';

export const equipmentApi = {
    getAllEquipment: async (filters = {}) => {
        const response = await apiClient.get('/equipment', {
            params: filters
        });
        return response.data;
    },

    addEquipment: async (data) => {
        const response = await apiClient.post('/equipment', data);
        return response.data;
    },

    updateEquipment: async (id, data) => {
        const response = await apiClient.patch(`/equipment/${id}`, data);
        return response.data;
    },

    deleteEquipment: async (id) => {
        const response = await apiClient.delete(`/equipment/${id}`);
        return response.data;
    },

    reportIssue: async (reportData) => {
        const response = await apiClient.post('/equipment/report-issue', reportData);
        return response.data;
    },

    getMaintenanceRequests: async (filters = {}) => {
        const response = await apiClient.get('/equipment/requests', {
            params: filters
        });
        return response.data;
    },

    updateMaintenanceStatus: async (id, status) => {
        const response = await apiClient.patch(`/equipment/requests/${id}`, { status });
        return response.data;
    }
};
