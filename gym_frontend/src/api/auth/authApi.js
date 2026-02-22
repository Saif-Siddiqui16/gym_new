import apiClient from '../apiClient';

const api = apiClient;

export const loginUser = async (email, password, role) => {
    try {
        const response = await api.post('/auth/login', { email, password, role });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Login failed';
    }
};

export const logoutUser = async () => {
    try {
        const response = await api.post('/auth/logout');
        return response.data;
    } catch (error) {
        console.error('Logout failed:', error);
    }
};

export const checkAuthStatus = async () => {
    try {
        const response = await api.get('/auth/check-auth');
        return response.data;
    } catch (error) {
        return null;
    }
};
