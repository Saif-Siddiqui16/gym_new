import apiClient from './apiClient';

export const feedbackApi = {
    getAllFeedback: async (params) => {
        const response = await apiClient.get('/feedback', { params });
        return response.data;
    },
    addFeedback: async (data) => {
        const response = await apiClient.post('/feedback', data);
        return response.data;
    },
    updateFeedbackStatus: async (id, status) => {
        const response = await apiClient.patch(`/feedback/${id}/status`, { status });
        return response.data;
    }
};
