import axios from 'axios';
import { createDemoAdapter, resetDemoState } from '../demo/mock-api.mjs';
import authService from "../iam/services/auth.service.js";

const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';
let demoStorage;
if (demoMode) { try { demoStorage = window.localStorage; } catch { /* Use memory when storage is blocked. */ } }

// demo helper: run ositopolarDemo.reset() in the browser console to restore the seed data
if (demoMode && typeof window !== 'undefined') {
    window.ositopolarDemo = { reset() { resetDemoState(demoStorage); window.location.reload(); } };
}

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const httpInstance = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    ...(demoMode ? { adapter: createDemoAdapter({ storage: demoStorage }) } : {}),
    timeout: 10000
});

httpInstance.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('[API Request Error]:', error);
        return Promise.reject(error);
    }
);

httpInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const errorMessage = error.response?.data?.message || error.message;
        const errorDetail = error.response?.data;
        const status = error.response?.status;
        const url = error.config?.url;

        console.error(`[API Error] ${status} ${url}:`, errorMessage);
        console.error('[API Error Detail]:', errorDetail);
        if (status === 401) {
            console.warn('Expired token or unauthorized access');
        } else if (status === 404) {
            console.warn('Not found');
        } else if (status >= 500) {
            console.error('Error in the server');
        }

        return Promise.reject(error);
    }
);

export default httpInstance;
