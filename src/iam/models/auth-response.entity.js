/**
 * @class AuthResponse
 * @description Entity class representing authentication response from backend
 */
export class AuthResponse {
    /**
     * @param {Object} [data={}] - Raw data object from the API response
     * @param {number} [data.id=0] - User ID
     * @param {string} [data.username=''] - Username
     * @param {string} [data.token=''] - JWT token
     */
    constructor({
                    id = 0,
                    username = '',
                    token = ''
                } = {}) {
        this.id = id;
        this.username = username;
        this.token = token;
    }
}