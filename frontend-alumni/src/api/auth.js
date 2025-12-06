import axios from 'axios';

/**
 * STANDARDIZED PORTS CONFIGURATION
 * Backend: http://localhost:5000
 * Frontend: http://localhost:3001
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token if available
api.interceptors.request.use(
    (config) => {
        // Check client-side only to avoid build errors
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        // Backend returns: { success: true, data: { token }, message: "..." }
        const token = response.data.data?.token || response.data.token;
        if (token) {
            localStorage.setItem('token', token);
        }
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

export const registerAlumni = async (data) => {
    try {
        const response = await api.post('/auth/register/alumni', data);
        return response.data;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

export const verifyAlumni = async () => {
    try {
        const response = await api.post('/auth/verify/alumni');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export default api;
