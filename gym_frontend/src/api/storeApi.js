import apiClient from './apiClient';

export const getStoreProducts = async (params = {}) => {
    try {
        const response = await apiClient.get('/store/products', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to load products';
    }
};

export const addStoreProduct = async (data) => {
    try {
        const response = await apiClient.post('/store/products', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to add product';
    }
};

export const updateStoreProductStock = async (id, stock) => {
    try {
        const response = await apiClient.patch(`/store/products/${id}/stock`, { stock });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update stock';
    }
};

export const updateStoreProduct = async (id, data) => {
    try {
        const response = await apiClient.put(`/store/products/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update product';
    }
};

export const deleteStoreProduct = async (id) => {
    try {
        const response = await apiClient.delete(`/store/products/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to delete product';
    }
};

export const getStoreOrders = async () => {
    try {
        const response = await apiClient.get('/store/orders');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to load orders';
    }
};

export const checkoutStoreOrder = async (data) => {
    try {
        const response = await apiClient.post('/store/checkout', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to checkout';
    }
};
