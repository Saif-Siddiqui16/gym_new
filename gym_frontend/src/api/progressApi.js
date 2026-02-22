import apiClient from './apiClient';

export const getProgress = async (memberId = null) => {
    const url = memberId ? `/trainer/members/${memberId}/progress` : '/member/progress';
    const response = await apiClient.get(url);
    return response.data;
};

export const logProgress = async (data) => {
    const response = await apiClient.post('/member/progress', data);
    return response.data;
};
