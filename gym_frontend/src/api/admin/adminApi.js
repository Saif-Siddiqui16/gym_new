import apiClient from '../apiClient';

export const createStaffAPI = async (staffData) => {
    const response = await apiClient.post('/admin/staff', staffData);
    return response.data;
};

export const fetchStaffAPI = async () => {
    const response = await apiClient.get('/admin/staff');
    return response.data;
};

export const createPayrollAPI = async (payrollData) => {
    const response = await apiClient.post('/admin/payroll', payrollData);
    return response.data;
};

export const fetchPayrollStaffAPI = async () => {
    const response = await apiClient.get('/admin/payroll/staff');
    return response.data;
};

export const fetchPayrollHistoryAPI = async () => {
    const response = await apiClient.get('/admin/payroll/history');
    return response.data;
};

export const updatePayrollStatusAPI = async (id, statusData) => {
    const response = await apiClient.patch(`/admin/payroll/${id}/status`, statusData);
    return response.data;
};

// Leave Requests
export const fetchLeaveRequestsAPI = async () => {
    const response = await apiClient.get('/admin/leave-requests');
    return response.data;
};

export const updateLeaveStatusAPI = async (id, status) => {
    const response = await apiClient.patch(`/admin/leave-requests/${id}/status`, { status });
    return response.data;
};

