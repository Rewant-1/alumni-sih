import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * STANDARDIZED PORTS CONFIGURATION
 * Backend: http://localhost:5000
 * Frontend: http://localhost:3001
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // increase timeout slightly and use retries in the verify call
    timeout: 15000,
});

// Add a request interceptor to include the auth token if available
api.interceptors.request.use(
    (config) => {
        // Check client-side only to avoid build errors
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterAlumniData {
    name: string;
    email: string;
    password: string;
    graduationYear: number;
    degreeUrl: string;
    collegeId: string;
}

export interface User {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    graduationYear?: number;
    degreeUrl?: string;
    collegeId?: string;
}

export interface AuthResponse {
    success: boolean;
    data?: {
        token?: string;
        user?: User;
    };
    token?: string;
    message?: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    // Backend returns: { success: true, data: { token }, message: "..." }
    const token = response.data.data?.token || response.data.token;
    if (token) {
        localStorage.setItem('token', token);
    }
    return response.data;
};

export const registerAlumni = async (data: RegisterAlumniData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register/alumni', data);
    return response.data;
};

export const verifyAlumni = async (): Promise<AuthResponse> => {
    // Try to get current user. Fall back with retries/backoff on transient network issues.
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const maxAttempts = 3;
    let attempt = 0;

    while (true) {
        try {
            // backend route: GET /auth/me
            const response = await api.get<AuthResponse>('/auth/me');
            // Prefer inner `data` payload produced by sendSuccess; otherwise return whole object
            return (response.data as any).data || response.data;
        } catch (error) {
            attempt++;
            if (attempt >= maxAttempts) {
                throw error;
            }
            // exponential backoff: 500ms, 1000ms ...
            const backoff = 500 * Math.pow(2, attempt - 1);
            await sleep(backoff);
        }
    }
};

export default api;
