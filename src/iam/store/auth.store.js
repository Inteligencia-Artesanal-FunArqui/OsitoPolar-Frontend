import { defineStore } from 'pinia';
import authService from '../services/auth.service';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
        isAuthenticated: false
    }),

    getters: {
        currentUser: (state) => state.user,
        username: (state) => state.user?.username || '',
        isLoggedIn: (state) => state.isAuthenticated
    },

    actions: {
        /**
         * Initialize auth state from localStorage
         */
        initializeAuth() {
            const token = authService.getToken();
            const user = authService.getCurrentUser();

            if (token && user) {
                this.token = token;
                this.user = user;
                this.isAuthenticated = true;
            } else {
                this.clearAuth();
            }
        },

        /**
         * Set authentication data after successful login
         */
        setAuth(userData) {
            this.user = userData;
            this.token = userData.token;
            this.isAuthenticated = true;
        },

        /**
         * Clear authentication data
         */
        clearAuth() {
            this.user = null;
            this.token = null;
            this.isAuthenticated = false;
        },

        /**
         * Sign out user
         */
        signOut() {
            authService.signOut();
            this.clearAuth();
        }
    }
});