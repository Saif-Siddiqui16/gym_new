import apiClient from './apiClient';

export const announcementApi = {
    getAllAnnouncements: async () => {
        const response = await apiClient.get('/announcements');
        return response.data;
    },
    addAnnouncement: async (data) => {
        const response = await apiClient.post('/announcements', data);
        return response.data;
    }
};
