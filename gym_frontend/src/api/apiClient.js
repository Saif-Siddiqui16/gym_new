import axios from 'axios';
import BaseUrl from './BaseUrl/BaseUrl';

// Create a centralized axios instance
const apiClient = axios.create({
    baseURL: BaseUrl,
    withCredentials: true,
});

// Response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors globally
        if (error.response?.status === 401) {
            console.warn('Unauthorized access detected. Redirecting to login...');

            // Clear local auth storage
            localStorage.removeItem('userRole');
            localStorage.removeItem('userData');

            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
