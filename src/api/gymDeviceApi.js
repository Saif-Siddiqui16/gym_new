import apiClient from './apiClient';

// ─── Dashboard summary (online/offline counts + recent records) ───
export const fetchGymDeviceDashboard = async (branchId = null) => {
    try {
        const headers = branchId ? { 'x-tenant-id': String(branchId) } : {};
        const response = await apiClient.get('/gym-device/dashboard', { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching gym device dashboard:', error);
        throw error;
    }
};

// ─── SmartAIoT device list (from MIPS) ───────────────────────────
export const fetchGymDevices = async (branchId = null) => {
    try {
        const headers = branchId ? { 'x-tenant-id': String(branchId) } : {};
        const response = await apiClient.get('/gym-device/devices', { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching gym devices:', error);
        throw error;
    }
};

// ─── Face access records ──────────────────────────────────────────
export const fetchFaceAccessRecords = async (branchId = null) => {
    try {
        const headers = branchId ? { 'x-tenant-id': String(branchId) } : {};
        const response = await apiClient.get('/gym-device/records', { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching face access records:', error);
        throw error;
    }
};

// ─── Departments ──────────────────────────────────────────────────
export const fetchGymDepartments = async (branchId = null) => {
    try {
        const headers = branchId ? { 'x-tenant-id': String(branchId) } : {};
        const response = await apiClient.get('/gym-device/departments', { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching gym departments:', error);
        throw error;
    }
};

// ─── Attendance summary (paginated) ──────────────────────────────
export const fetchGymAttendanceSummary = async (page = 1, limit = 10, branchId = null) => {
    try {
        const headers = branchId ? { 'x-tenant-id': String(branchId) } : {};
        const response = await apiClient.get(
            `/gym-device/attendance-summary?page=${page}&limit=${limit}`,
            { headers }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching gym attendance summary:', error);
        throw error;
    }
};

// ─── DB Devices CRUD (/api/v1/devices) ───────────────────────────
export const fetchDevicesFromDB = async (branchId = null) => {
    try {
        const params = branchId ? { branchId } : {};
        const response = await apiClient.get('/devices', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching devices from DB:', error);
        throw error;
    }
};

export const addDeviceToDB = async (deviceData) => {
    try {
        const response = await apiClient.post('/devices', deviceData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateDeviceInDB = async (id, deviceData) => {
    try {
        const response = await apiClient.patch(`/devices/${id}`, deviceData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteDeviceFromDB = async (id) => {
    try {
        const response = await apiClient.delete(`/devices/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ─── MIPS Person Sync ─────────────────────────────────────────────
export const syncMemberToMips = async (memberId, branchId) => {
    try {
        const response = await apiClient.post(`/mips-sync/member/${memberId}`, { branchId });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const syncStaffToMips = async (userId, branchId) => {
    try {
        const response = await apiClient.post(`/mips-sync/staff/${userId}`, { branchId });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const revokeMipsAccess = async (memberId, branchId) => {
    try {
        const response = await apiClient.post(`/mips-sync/revoke/${memberId}`, { branchId });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const restoreMipsAccess = async (memberId, branchId) => {
    try {
        const response = await apiClient.post(`/mips-sync/restore/${memberId}`, { branchId });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getMemberSyncStatus = async (memberId) => {
    try {
        const response = await apiClient.get(`/mips-sync/status/member/${memberId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getStaffSyncStatus = async (userId) => {
    try {
        const response = await apiClient.get(`/mips-sync/status/staff/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ─── Remote Device Actions ────────────────────────────────────────
export const openDeviceDoor = async (deviceId) => {
    try {
        const response = await apiClient.post(`/devices/${deviceId}/open-door`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const rebootDevice = async (deviceId) => {
    try {
        const response = await apiClient.post(`/devices/${deviceId}/reboot`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ─── MIPS Connection Management (SuperAdmin) ──────────────────────
export const fetchMipsConnections = async () => {
    try {
        const response = await apiClient.get('/devices/mips-connections');
        return response.data;
    } catch (error) {
        console.error('Error fetching MIPS connections:', error);
        throw error;
    }
};

export const saveMipsConnection = async (data) => {
    try {
        const response = await apiClient.post('/devices/mips-connections', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const removeMipsConnection = async (branchId) => {
    try {
        const response = await apiClient.delete(`/devices/mips-connections/${branchId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
