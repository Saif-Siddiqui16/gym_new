import apiClient from './apiClient';

export const inventoryApi = {
    getAllInventory: async () => {
        const response = await apiClient.get('/inventory');
        return response.data;
    },

    addInventoryItem: async (data) => {
        const response = await apiClient.post('/inventory', data);
        return response.data;
    },

    updateInventoryItem: async (id, data) => {
        const response = await apiClient.patch(`/inventory/${id}`, data);
        return response.data;
    },

    recordUsage: async (data) => {
        const response = await apiClient.post(`/inventory/usage`, data);
        return response.data;
    },

    receiveStock: async (data) => {
        const response = await apiClient.post(`/inventory/restock`, data);
        return response.data;
    },

    deleteInventoryItem: async (id) => {
        const response = await apiClient.delete(`/inventory/${id}`);
        return response.data;
    }
};
