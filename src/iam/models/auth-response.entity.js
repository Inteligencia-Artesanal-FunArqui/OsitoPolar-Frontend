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
                    token = '',
                    userType = null,
                    companyName = null,
                    profileId = null,
                    planId = null,
                    technicianId = null
                } = {}) {
        this.id = id;
        this.username = username;
        this.token = token;
        // optional extras the real backend sends on sign-in (Owner / Provider)
        this.userType = userType;
        this.companyName = companyName;
        this.profileId = profileId;
        this.planId = planId;
        // demo-only Technician login: row id in the technicians collection
        this.technicianId = technicianId;
    }
}