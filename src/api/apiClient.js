import axios from 'axios';
import BaseUrl from './BaseUrl/BaseUrl';

// Create a centralized axios instance
const apiClient = axios.create({
    baseURL: BaseUrl,
    withCredentials: true,
});

// Request interceptor to add tenant-id from localStorage
apiClient.interceptors.request.use(
    (config) => {
        const selectedBranch = localStorage.getItem('selectedBranch');
        // Do not overwrite if already explicitly set or if specifically cleared (null/undefined)
        if (config.headers['x-tenant-id'] === 'none') {
            delete config.headers['x-tenant-id'];
        } else if (selectedBranch && config.headers['x-tenant-id'] === undefined) {
            config.headers['x-tenant-id'] = selectedBranch;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors globally
        if (error.response?.status === 401) {
            console.warn('Unauthorized access detected.');

            // DISABLED: Automatic logout on 401 to prevent flickering in demo mode
            /*
            localStorage.removeItem('userRole');
            localStorage.removeItem('userData');

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            */
        }
        return Promise.reject(error);
    }
);

export default apiClient;
