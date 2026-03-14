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

export const getStoreOrders = async (params = {}) => {
    try {
        const response = await apiClient.get('/store/orders', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to load orders';
    }
};

export const fetchOrderById = async (id) => {
    try {
        const response = await apiClient.get(`/store/orders/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to load order details';
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

// Coupon APIs
export const getCoupons = async (params = {}) => {
    try {
        const response = await apiClient.get('/store/coupons', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to load coupons';
    }
};

export const getAvailableCoupons = async () => {
    try {
        const response = await apiClient.get('/store/coupons/available');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to load available coupons';
    }
};

export const getAvailableCouponsForMember = async (memberId) => {
    try {
        const response = await apiClient.get(`/store/coupons/available/${memberId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to load available coupons for member';
    }
};

export const validateCoupon = async (code, totalAmount) => {
    try {
        const response = await apiClient.get(`/store/coupons/validate/${code}`, {
            params: { totalAmount }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Invalid coupon';
    }
};

export const getCouponStats = async (params = {}) => {
    try {
        const response = await apiClient.get('/store/coupons/stats', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to load coupon stats';
    }
};

export const createCoupon = async (data) => {
    try {
        const response = await apiClient.post('/store/coupons', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to create coupon';
    }
};

export const updateCoupon = async (id, data) => {
    try {
        const response = await apiClient.put(`/store/coupons/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update coupon';
    }
};

export const deleteCoupon = async (id) => {
    try {
        const response = await apiClient.delete(`/store/coupons/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to delete coupon';
    }
};

// Category APIs
export const getCategories = async (params = {}) => {
    try {
        const response = await apiClient.get('/store/categories', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to load categories';
    }
};

export const createCategory = async (data) => {
    try {
        const response = await apiClient.post('/store/categories', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to create category';
    }
};

export const updateCategory = async (id, data) => {
    try {
        const response = await apiClient.put(`/store/categories/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update category';
    }
};

export const deleteCategory = async (id) => {
    try {
        const response = await apiClient.delete(`/store/categories/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to delete category';
    }
};
export const getStoreStats = async (params = {}) => {
    try {
        const response = await apiClient.get('/store/stats', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to load store stats';
    }
};
