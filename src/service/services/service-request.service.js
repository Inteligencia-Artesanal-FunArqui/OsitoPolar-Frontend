import httpInstance from "../../shared/http.instance.js";
import { ServiceRequest } from "../models/service-request.entity.js";

/**
 * @class ServiceRequestService
 * @description Service class for handling service request operations using HTTP requests
 */
export class ServiceRequestService {
    constructor() {
        this.baseUrl = '/service-requests';
    }

    /**
     * Fetches all service requests from the server
     * @returns {Promise} A promise resolving to an array of service requests
     */
    getAll() {
        return httpInstance.get(this.baseUrl);
    }

    /**
     * Fetches a specific service request by ID
     * @param {number|string} id - The ID of the service request to retrieve
     * @returns {Promise} A promise resolving to a service request object
     */
    getById(id) {
        return httpInstance.get(`${this.baseUrl}/${id}`);
    }

    /**
     * Sends a request to create a new service request
     * @param {Object} requestData - The data of the service request to be created
     * @returns {Promise} A promise resolving to the created service request
     */
    createRequest(requestData) {
        // If it's a ServiceRequest instance, convert to API format
        const payload = requestData instanceof ServiceRequest
            ? requestData.toApiFormat()
            : requestData;

        // Log the payload to debug
        console.log('ServiceRequestService sending payload:', payload);

        // Don't stringify here - axios does it automatically
        return httpInstance.post(this.baseUrl, payload);
    }

    /**
     * Updates an existing service request
     * @param {number|string} id - The ID of the service request to update
     * @param {Object} requestData - The updated data for the service request
     * @returns {Promise} A promise resolving to the updated service request
     */
    updateRequest(id, requestData) {
        // If it's a ServiceRequest instance, convert to API format
        const payload = requestData instanceof ServiceRequest
            ? requestData.toApiFormat()
            : requestData;

        return httpInstance.put(`${this.baseUrl}/${id}`, payload);
    }

    /**
     * Assign a technician to a service request
     * @param {number|string} serviceRequestId - The ID of the service request
     * @param {number} technicianId - The ID of the technician to assign
     * @returns {Promise} A promise resolving to the updated service request
     */
    assignTechnician(serviceRequestId, technicianId) {
        return httpInstance.put(
            `${this.baseUrl}/${serviceRequestId}/assign-technician`,
            { technicianId }
        );
    }

    /**
     * Add customer feedback rating to a service request
     * @param {number|string} serviceRequestId - The ID of the service request
     * @param {number} rating - Rating value (1-5)
     * @returns {Promise} A promise resolving to the updated service request
     */
    addFeedback(serviceRequestId, rating) {
        return httpInstance.put(
            `${this.baseUrl}/${serviceRequestId}/feedback`,
            { rating }
        );
    }

    /**
     * Reject a pending service request
     * @param {number|string} serviceRequestId - The ID of the service request
     * @returns {Promise} A promise resolving to the updated service request
     */
    rejectRequest(serviceRequestId) {
        return httpInstance.put(`${this.baseUrl}/${serviceRequestId}/reject`);
    }

    /**
     * Cancel a service request
     * @param {number|string} serviceRequestId - The ID of the service request
     * @returns {Promise} A promise resolving to the updated service request
     */
    cancelRequest(serviceRequestId) {
        return httpInstance.put(`${this.baseUrl}/${serviceRequestId}/cancel`);
    }

    /**
     * Deletes a service request by ID
     * @param {number|string} id - The ID of the service request to delete
     * @returns {Promise} A promise resolving when the service request is deleted
     */
    deleteRequest(id) {
        return httpInstance.delete(`${this.baseUrl}/${id}`);
    }

    /**
     * Retrieves service requests filtered by status
     * @param {string} status - The status to filter by (e.g., "pending", "in_progress", "resolved")
     * @returns {Promise} A promise resolving to a filtered list of service requests
     */
    getByStatus(status) {
        return httpInstance.get(`${this.baseUrl}?status=${status}`);
    }

    /**
     * Retrieves service requests filtered by userId
     * @param {number|string} userId
     * @returns {Promise}
     */
    getByUser(userId) {
        return httpInstance.get(`${this.baseUrl}?userId=${userId}`);
    }

    /**
     * Retrieves service requests filtered by companyId
     * @param {number|string} companyId
     * @returns {Promise}
     */
    getByCompany(companyId) {
        return httpInstance.get(`${this.baseUrl}?companyId=${companyId}`);
    }

    /**
     * Retrieves service requests filtered by equipmentId
     * @param {number|string} equipmentId
     * @returns {Promise}
     */
    getByEquipment(equipmentId) {
        return httpInstance.get(`${this.baseUrl}?equipmentId=${equipmentId}`);
    }

    /**
     * Maps raw API response data to ServiceRequest entity instances
     * @param {Array|Object} data - Raw response data from the API
     * @returns {Array<ServiceRequest>|ServiceRequest} A mapped service request instance or array
     */
    mapServiceRequests(data) {
        if (Array.isArray(data)) {
            return data.map(item => new ServiceRequest({
                ...item,
                assignedTechnicianId: item.assignedTechnicianId || item.technicianId, // Handle legacy field
                customerFeedbackRating: item.customerFeedbackRating || item.rating // Handle legacy field
            }));
        }
        return new ServiceRequest({
            ...data,
            assignedTechnicianId: data.assignedTechnicianId || data.technicianId, // Handle legacy field
            customerFeedbackRating: data.customerFeedbackRating || data.rating // Handle legacy field
        });
    }
    updateStatus(serviceRequestId, newStatus) {
        return httpInstance.put(
            `${this.baseUrl}/${serviceRequestId}/status`,
            { newStatus }
        );
    }

}