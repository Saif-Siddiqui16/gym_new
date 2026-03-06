import apiClient from './apiClient';

export const rewardApi = {
    getAllRewards: async () => {
        const response = await apiClient.get('/rewards');
        return response.data;
    },
    addReward: async (data) => {
        const response = await apiClient.post('/rewards', data);
        return response.data;
    }
};
