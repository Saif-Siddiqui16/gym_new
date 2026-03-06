import apiClient from '../apiClient';

export const getPaymentHistory = async (filters = {}) => {
    try {
        const response = await apiClient.get('/staff/payments', { params: filters });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch payment history';
    }
};

export const collectPayment = async (paymentData) => {
    try {
        const response = await apiClient.post('/staff/payments', paymentData);
        return { success: true, message: 'Payment collected successfully', data: response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to collect payment' };
    }
};
