import apiClient from '../apiClient';
import { paginateData } from './trainerPagination';
import { filterData } from './trainerFilters';

// --- PROFILE API ---
export const fetchTrainerProfile = async () => {
    try {
        const response = await apiClient.get('/trainer/profile');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch trainer profile';
    }
};

// SUMMARY REPORTS
export const getTrainerDashboardStats = async () => {
    try {
        const response = await apiClient.get('/trainer/dashboard-stats');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch dashboard stats';
    }
};

// EARNINGS
export const getTrainerEarnings = async () => {
    try {
        const response = await apiClient.get('/trainer/earnings');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch trainer earnings';
    }
};

// ATTENDANCE
export const getTrainerAttendance = async () => {
    try {
        const response = await apiClient.get('/trainer/attendance');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch trainer attendance';
    }
};

export const checkInTrainer = async (data = {}) => {
    try {
        const response = await apiClient.post('/trainer/attendance/check-in', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to check in/out';
    }
};

export const requestLeave = async (data) => {
    try {
        const response = await apiClient.post('/trainer/attendance/leave', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to request leave';
    }
};

// AVAILABILITY
export const getTrainerAvailability = async () => {
    try {
        const response = await apiClient.get('/trainer/availability');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch availability settings';
    }
};

export const updateTrainerAvailability = async (data) => {
    try {
        const response = await apiClient.patch('/trainer/availability', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update availability settings';
    }
};

export const deleteTrainerTimeOff = async (id) => {
    try {
        const response = await apiClient.delete(`/trainer/availability/time-off/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to delete time off';
    }
};

export const updateTrainerProfile = async (updated) => {
    try {
        const response = await apiClient.patch('/trainer/profile', updated);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update trainer profile';
    }
};

export const changeTrainerPassword = async (data) => {
    try {
        const response = await apiClient.post('/trainer/change-password', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to change password';
    }
};

// --- CLASSES API ---
export const getTrainerClasses = async () => {
    const response = await apiClient.get('/trainer/classes');
    return response.data;
};

export const getTrainerClassById = async (id) => {
    const response = await apiClient.get(`/trainer/classes/${id}`);
    return response.data;
};

// --- TRAINER API FUNCTIONS ---

// DIET PLANS
export const getDietPlans = async () => {
    const response = await apiClient.get('/trainer/diet-plans');
    return response.data;
};

export const createDietPlan = async (data) => {
    const response = await apiClient.post('/trainer/diet-plans', data);
    return response.data;
};

export const updateDietPlan = async (id, data) => {
    const response = await apiClient.patch(`/trainer/diet-plans/${id}`, data);
    return response.data;
};

export const toggleDietPlanStatus = async (id) => {
    const response = await apiClient.patch(`/trainer/diet-plans/${id}/status`);
    return response.data;
};

// WORKOUT PLANS
export const getWorkoutPlans = async () => {
    const response = await apiClient.get('/trainer/workout-plans');
    return response.data;
};

export const createWorkoutPlan = async (data) => {
    const response = await apiClient.post('/trainer/workout-plans', data);
    return response.data;
};

export const updateWorkoutPlan = async (id, data) => {
    const response = await apiClient.patch(`/trainer/workout-plans/${id}`, data);
    return response.data;
};

export const toggleWorkoutPlanStatus = async (id) => {
    const response = await apiClient.patch(`/trainer/workout-plans/${id}/status`);
    return response.data;
};

// MEMBERS
export const getAssignedMembers = async ({ filters = {}, page = 1, limit = 5 } = {}) => {
    try {
        const response = await apiClient.get('/trainer/members');
        let filtered = filterData(response.data, filters);
        return paginateData(filtered, page, limit);
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch assigned members';
    }
};

export const getMemberById = async (id) => {
    try {
        const response = await apiClient.get(`/trainer/members/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch member details';
    }
};

export const flagMember = async (id, reason) => {
    try {
        const response = await apiClient.patch(`/trainer/members/${id}/flag`, { reason });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to flag member';
    }
};

// SESSIONS
export const getSessions = async ({ filters = {}, page = 1, limit = 10 } = {}) => {
    try {
        const response = await apiClient.get('/trainer/sessions');
        let filtered = filterData(response.data, filters);
        return paginateData(filtered, page, limit);
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch sessions';
    }
};

export const createSession = async (sessionData) => {
    try {
        const response = await apiClient.post('/trainer/sessions', sessionData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to create session';
    }
};

export const getSessionsByDateRange = async (startDate, endDate) => {
    try {
        const response = await apiClient.get('/trainer/sessions');
        // Client side filtering for visual date-range picker just like previous mock behaviors
        return response.data.filter(s => {
            const sDate = new Date(s.date);
            return sDate >= new Date(startDate) && sDate <= new Date(endDate);
        });
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch sessions by date';
    }
};

export const updateSessionStatus = async (id, status) => {
    try {
        const response = await apiClient.patch(`/trainer/sessions/${id}/status`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update session status';
    }
};

// ATTENDANCE
export const getSessionHistory = async ({ filters = {}, page = 1, limit = 5 } = {}) => {
    try {
        const response = await apiClient.get('/trainer/session-history');
        let filtered = filterData(response.data, filters);
        return paginateData(filtered, page, limit);
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch session history';
    }
};

export const saveAttendance = async (sessionId, attendanceData) => {
    try {
        const response = await apiClient.post(`/trainer/sessions/${sessionId}/attendance`, attendanceData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to save attendance';
    }
};

// TASKS
export const getTasks = async ({ filters = {}, page = 1, limit = 5 } = {}) => {
    try {
        const response = await apiClient.get('/trainer/tasks');
        let filtered = filterData(response.data, filters);
        return paginateData(filtered, page, limit);
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch tasks';
    }
};

export const updateTaskStatus = async (id, status) => {
    try {
        const response = await apiClient.patch(`/trainer/tasks/${id}/status`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to update task status';
    }
};

// PAYMENTS (Read-only view for trainer dashboard)
export const getMemberPayments = async (memberId) => {
    try {
        const response = await apiClient.get(`/trainer/members/${memberId}/payments`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch member payments';
    }
};
