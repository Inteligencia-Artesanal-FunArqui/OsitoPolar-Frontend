import httpInstance from "../../shared/http.instance.js";
import { AuthResponse } from '../models/auth-response.entity';

/**
 * @class AuthService
 * @description Service for handling authentication operations
 */
class AuthService {
    constructor() {
        this._authEndpoint = '/authentication';
        this._usersEndpoint = '/users';
    }

    /**
     * Sign in a user
     * @param {string} username
     * @param {string} password
     * @returns {Promise<AuthResponse>}
     */
    async signIn(username, password) {
        if (!username?.trim() || !password?.trim()) {
            throw new Error('Username and password are required');
        }

        const response = await httpInstance.post(`${this._authEndpoint}/sign-in`, {
            username: username.trim(),
            password
        });

        const authResponse = new AuthResponse(response.data);

        if (authResponse.token) {
            this._saveAuthData(authResponse);
        }

        return authResponse;
    }

    /**
     * Sign up a new user
     * @param {string} username
     * @param {string} password
     * @returns {Promise<Object>}
     */
    async signUp(username, password) {
        const response = await httpInstance.post(`${this._authEndpoint}/sign-up`, {
            username,
            password
        });

        return response.data;
    }

    /**
     * Sign out current user
     */
    signOut() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete httpInstance.defaults.headers.common['Authorization'];

        // Emit custom event to notify components
        window.dispatchEvent(new CustomEvent('auth-changed'));
    }

    /**
     * Get current authenticated user
     * @returns {AuthResponse|null}
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? new AuthResponse(JSON.parse(userStr)) : null;
    }

    /**
     * Get current token
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.getToken();
    }

    /**
     * Save authentication data to localStorage
     * @private
     * @param {AuthResponse} authData
     */
    _saveAuthData(authData) {
        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', JSON.stringify(authData));
        httpInstance.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;


        window.dispatchEvent(new CustomEvent('auth-changed', {
            detail: authData
        }));
    }
}

export default new AuthService();