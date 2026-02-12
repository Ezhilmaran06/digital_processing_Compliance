import axios from 'axios';

/**
 * Base Axios instance with default configuration
 */
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request interceptor - Add auth token to requests
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - Handle errors globally
 */
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        const status = error.response?.status;

        // Handle 401 - Unauthorized (token expired or invalid)
        if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Avoid redirect loop if already on login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        // Create a custom error object that has message and status
        const err = new Error(message);
        err.status = status;
        err.response = error.response; // Keep the original response if needed

        return Promise.reject(err);
    }
);

export default api;
