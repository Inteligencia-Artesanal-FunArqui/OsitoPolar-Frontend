import httpInstance from "../../shared/http.instance.js";
import { RentalRequest } from "../models/rental-request.entity.js";

/**
 * @class RentalRequestService
 * @description Service for managing rental requests
 */
export class RentalRequestService {
    /**
     * Create new rental request
     * @param {Object} requestData - Request data
     * @returns {Promise} Promise that resolves to created request
     */
    createRentalRequest(requestData) {
        return httpInstance.post('/rentalRequests', requestData);
    }

    /**
     * Get user's rental requests
     * @param {string} userId - User ID
     * @returns {Promise} Promise that resolves to requests
     */
    getUserRentalRequests(userId) {
        return httpInstance.get(`/rentalRequests?userId=${userId}`);
    }

    /**
     * Update rental request
     * @param {string} requestId - Request ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise} Promise that resolves to updated request
     */
    updateRentalRequest(requestId, updates) {
        return httpInstance.put(`/rentalRequests/${requestId}`, updates);
    }

    /**
     * Submit request for approval
     * @param {string} requestId - Request ID
     * @returns {Promise} Promise that resolves to submitted request
     */
    submitRentalRequest(requestId) {
        // For json-server, just update the status
        return httpInstance.patch(`/rentalRequests/${requestId}`, {
            status: 'submitted',
            updatedAt: new Date().toISOString()
        });
    }

    /**
     * Cancel rental request
     * @param {string} requestId - Request ID
     * @returns {Promise} Promise that resolves to cancelled request
     */
    cancelRentalRequest(requestId) {
        // For json-server, just update the status
        return httpInstance.patch(`/rentalRequests/${requestId}`, {
            status: 'cancelled',
            updatedAt: new Date().toISOString()
        });
    }

    /**
     * Map API response to RentalRequest entities
     * @param {Array} data - Raw API data
     * @returns {Array<RentalRequest>} Array of mapped entities
     */
    mapRentalRequests(data) {
        return data.map(item => new RentalRequest(item));
    }
}