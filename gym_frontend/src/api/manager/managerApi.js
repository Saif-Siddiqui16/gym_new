import apiClient from '../apiClient';

// --- PROFILE API ---
export const fetchManagerProfile = async () => {
    const response = await apiClient.get('/admin/profile'); // Adjust endpoint if different
    return response.data;
};

export const updateManagerProfile = async (updated) => {
    const response = await apiClient.patch('/admin/profile', updated);
    return response.data;
};

export const changePassword = async (passwords) => {
    const response = await apiClient.post('/admin/change-password', passwords);
    return response.data;
};

// --- SETTINGS API ---
export const fetchTenantSettings = async () => {
    const response = await apiClient.get('/admin/settings/tenant');
    return response.data;
};

export const updateTenantSettings = async (settings) => {
    const response = await apiClient.patch('/admin/settings/tenant', settings);
    return response.data;
};

// --- MEMBERS API ---

export const getMembers = async ({ filters = {}, page = 1, limit = 5 } = {}) => {
    const params = {
        page,
        limit,
        search: filters.search,
        status: filters.status
    };
    const response = await apiClient.get('/admin/members', { params });
    // If backend doesn't support pagination yet, we might need to handle it here or update backend
    // admin.controller.js getAllMembers doesn't seem to have pagination logic yet, but returns all.
    return {
        data: response.data,
        total: response.data.length
    };
};

export const getMemberStats = async () => {
    const response = await apiClient.get('/admin/dashboard-cards');
    // Map dashboard cards to the format expected by the stats component if needed
    return {
        total: 0, // Placeholder
        active: 0,
        expired: 0,
        inactive: 0,
        trends: {}
    };
};

export const getMemberById = async (id) => {
    const response = await apiClient.get(`/admin/members/${id}`);
    return response.data;
};

export const createMember = async (memberData) => {
    const response = await apiClient.post('/admin/members', memberData);
    return response.data;
};

export const updateMember = async (id, memberData) => {
    const response = await apiClient.patch(`/admin/members/${id}`, memberData);
    return response.data;
};

export const deleteMember = async (id) => {
    const response = await apiClient.delete(`/admin/members/${id}`);
    return response.data;
};

export const toggleMemberStatus = async (id) => {
    const response = await apiClient.patch(`/admin/members/${id}/toggle-status`);
    return response.data;
};

// --- BOOKINGS API ---

export const getBookings = async ({ filters = {}, page = 1, limit = 5 } = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/admin/bookings', { params });
    return response.data;
};

export const getBookingStats = async () => {
    const response = await apiClient.get('/admin/bookings/stats');
    return response.data;
};

export const getBookingsByDateRange = async (startDate, endDate) => {
    const params = { start: startDate, end: endDate };
    const response = await apiClient.get('/admin/bookings/range', { params });
    return response.data;
};

export const getBookingById = async (id) => {
    const response = await apiClient.get(`/admin/bookings/${id}`);
    return response.data;
};

export const updateBookingStatus = async (id, status) => {
    const response = await apiClient.patch(`/admin/bookings/${id}/status`, { status });
    return response.data;
};

export const createBooking = async (bookingData) => {
    const response = await apiClient.post('/admin/bookings', bookingData);
    return response.data;
};

export const deleteBooking = async (id) => {
    const response = await apiClient.delete(`/admin/bookings/${id}`);
    return response.data;
};

// --- ATTENDANCE API ---

export const getCheckIns = async ({ filters = {}, page = 1, limit = 5 } = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/admin/attendance', { params });
    return response.data;
};

export const deleteCheckIn = async (id) => {
    const response = await apiClient.delete(`/admin/attendance/${id}`);
    return response.data;
};

export const getAttendanceStats = async () => {
    const response = await apiClient.get('/admin/attendance/stats');
    return response.data;
};

// --- TASKS API ---

export const getTasks = async ({ filters = {}, page = 1, limit = 5 } = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/admin/tasks', { params });
    return response.data;
};

export const getTaskStats = async () => {
    const response = await apiClient.get('/admin/tasks/stats');
    return response.data;
};

export const updateTaskStatus = async (id, status) => {
    const response = await apiClient.patch(`/admin/tasks/${id}/status`, { status });
    return response.data;
};

export const updateTask = async (id, taskData) => {
    const response = await apiClient.patch(`/admin/tasks/${id}`, taskData);
    return response.data;
};

export const createTask = async (taskData) => {
    const response = await apiClient.post('/admin/tasks', taskData);
    return response.data;
};

export const deleteTask = async (id) => {
    const response = await apiClient.delete(`/admin/tasks/${id}`);
    return response.data;
};

export const getRenewalAlerts = async ({ type = 'expiring', search = '' } = {}) => {
    const params = { type, search };
    const response = await apiClient.get('/admin/members/renewal-alerts', { params });
    return response.data;
};

export const renewMembership = async (data) => {
    const response = await apiClient.post('/admin/members/renewal/renew', data);
    return response.data;
};

// --- STAFF API ---
export const getAllStaff = async () => {
    const response = await apiClient.get('/admin/staff');
    return response.data;
};

export const getAllPlans = async () => {
    const response = await apiClient.get('/admin/plans');
    return response.data;
};

export const getClasses = async () => {
    const response = await apiClient.get('/admin/classes');
    return response.data;
};

// --- COMMUNICATION API ---

export const getAnnouncements = async () => {
    const response = await apiClient.get('/admin/communication/announcements');
    return response.data;
};

export const createAnnouncement = async (data) => {
    const response = await apiClient.post('/admin/communication/announcements', data);
    return response.data;
};

export const getChats = async () => {
    const response = await apiClient.get('/admin/communication/chats');
    return response.data;
};

export const getMessages = async (chatId) => {
    const response = await apiClient.get(`/admin/communication/chats/${chatId}/messages`);
    return response.data;
};

export const sendMessage = async (chatId, text) => {
    const response = await apiClient.post(`/admin/communication/chats/${chatId}/send`, { text });
    return response.data;
};

export const getChatUsers = async () => {
    const response = await apiClient.get('/admin/communication/chat-users');
    return response.data;
};
