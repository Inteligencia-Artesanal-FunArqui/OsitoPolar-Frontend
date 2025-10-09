import httpInstance from "../../shared/http.instance.js";
import { Equipment } from "../models/equipment.entity.js";

/**
 * @class EquipmentService
 * @description Simplified service matching C# API directly
 */
export class EquipmentService {
    constructor() {

        this.baseUrl = '/equipments';
    }

    /**
     * Get all equipments
     * @returns {Promise<Array<Equipment>>} List of Equipment instances
     */
    async getAllEquipments() {
        try {
            const response = await httpInstance.get(this.baseUrl);

            return response.data.map(equipmentData => new Equipment(equipmentData));

        } catch (error) {
            console.error(' Error fetching equipments:', error);
            throw this.handleError(error, 'Failed to fetch equipments');
        }
    }

    /**
     * Get equipment by ID
     * @param {number} equipmentId - Equipment ID
     * @returns {Promise<Equipment>} Equipment instance
     */
    async getEquipmentById(equipmentId) {
        try {
            const response = await httpInstance.get(`${this.baseUrl}/${equipmentId}`);

            return new Equipment(response.data);

        } catch (error) {
            console.error(`Error fetching equipment ${equipmentId}:`, error);
            throw this.handleError(error, `Equipment with ID ${equipmentId} not found`);
        }
    }

    /**
     * Get equipments by owner
     * @param {number} ownerId - Owner ID
     * @returns {Promise<Array<Equipment>>} List of Equipment instances
     */
    async getEquipmentsByOwner(ownerId) {
        try {
            const response = await httpInstance.get(`${this.baseUrl}/owners/${ownerId}`);

            return response.data.map(equipmentData => new Equipment(equipmentData));

        } catch (error) {
            console.error(`Error fetching equipments for owner ${ownerId}:`, error);
            throw this.handleError(error, `Failed to fetch equipments for owner ${ownerId}`);
        }
    }

    /**
     * Create new equipment
     * @param {Equipment|Object} equipmentData - Equipment data or Equipment instance
     * @returns {Promise<Equipment>} Created Equipment instance
     */
    async createEquipment(equipmentData) {
        try {

            const payload = equipmentData instanceof Equipment
                ? equipmentData.toApiFormat()
                : equipmentData;

            const response = await httpInstance.post(this.baseUrl, payload);

            return new Equipment(response.data);

        } catch (error) {
            console.error(' Error creating equipment:', error);
            throw this.handleError(error, 'Failed to create equipment');
        }
    }

    /**
     * Update equipment operations (temperature, power, location)
     * @param {number} equipmentId - Equipment ID
     * @param {Object} operationData - Operation data
     * @returns {Promise<Equipment>} Updated Equipment instance
     */
    async updateEquipmentOperations(equipmentId, operationData) {
        try {
            const response = await httpInstance.patch(`${this.baseUrl}/${equipmentId}/operations`, operationData);

            return new Equipment(response.data);

        } catch (error) {
            console.error(` Error updating equipment ${equipmentId} operations:`, error);
            throw this.handleError(error, 'Failed to update equipment operations');
        }
    }

    /**
     * Update complete equipment
     * @param {number} equipmentId - Equipment ID
     * @param {Equipment|Object} equipmentData - Equipment data or Equipment instance
     * @returns {Promise<Equipment>} Updated Equipment instance
     */
    async updateEquipment(equipmentId, equipmentData) {
        try {
            const payload = equipmentData instanceof Equipment
                ? equipmentData.toApiFormat()
                : equipmentData;

            const response = await httpInstance.put(`${this.baseUrl}/${equipmentId}`, payload);

            return new Equipment(response.data);

        } catch (error) {
            console.error(` Error updating equipment ${equipmentId}:`, error);
            throw this.handleError(error, 'Failed to update equipment');
        }
    }

    /**
     * Delete equipment
     * @param {number} equipmentId - Equipment ID
     * @returns {Promise<void>}
     */
    async deleteEquipment(equipmentId) {
        try {
            await httpInstance.delete(`${this.baseUrl}/${equipmentId}`);
        } catch (error) {
            console.error(`Error deleting equipment ${equipmentId}:`, error);
            throw this.handleError(error, 'Failed to delete equipment');
        }
    }

    /**
     * Create equipment reading
     * @param {number} equipmentId - Equipment ID
     * @param {Object} readingData - Reading data
     * @returns {Promise<void>}
     */
    async createEquipmentReading(equipmentId, readingData) {
        try {
            const payload = {
                type: readingData.type || 'temperature',
                value: readingData.value,
                unit: readingData.unit || 'celsius',
                timestamp: readingData.timestamp || new Date().toISOString(),
                status: readingData.status || 'normal',
                notes: readingData.notes || ''
            };

            await httpInstance.post(`${this.baseUrl}/${equipmentId}/readings`, payload);
        } catch (error) {
            console.error(`Error creating reading for equipment ${equipmentId}:`, error);
            throw this.handleError(error, 'Failed to create equipment reading');
        }
    }

    /**
     * Handle and format API errors
     * @param {Error} error - Original error
     * @param {string} defaultMessage - Default error message
     * @returns {Error} Formatted error
     */
    handleError(error, defaultMessage) {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || defaultMessage;

            switch (status) {
                case 400:
                    return new Error(`Invalid request: ${message}`);
                case 401:
                    return new Error('Unauthorized access');
                case 403:
                    return new Error('Access forbidden');
                case 404:
                    return new Error('Equipment not found');
                case 409:
                    return new Error('Equipment already exists (duplicate serial number or code)');
                case 500:
                    return new Error('Server error. Please try again later.');
                default:
                    return new Error(`Error ${status}: ${message}`);
            }
        } else if (error.request) {
            return new Error('Network error. Please check your connection.');
        } else {
            return new Error(error.message || defaultMessage);
        }
    }

    // ===============================
    // UTILITY METHODS
    // ===============================

    /**
     * Get equipment by serial number
     * @param {string} serialNumber - Serial number
     * @returns {Promise<Equipment|null>} Equipment instance or null
     */
    async getBySerialNumber(serialNumber) {
        try {
            const equipments = await this.getAllEquipments();
            return equipments.find(eq => eq.serialNumber === serialNumber) || null;
        } catch (error) {
            console.error(` Error finding equipment by serial ${serialNumber}:`, error);
            return null;
        }
    }

    /**
     * Get equipments by type
     * @param {string} type - Equipment type
     * @returns {Promise<Array<Equipment>>} Filtered equipments
     */
    async getByType(type) {
        try {
            const equipments = await this.getAllEquipments();
            return equipments.filter(eq => eq.type === type);
        } catch (error) {
            console.error(` Error fetching equipments by type ${type}:`, error);
            throw this.handleError(error, 'Failed to fetch equipments by type');
        }
    }

    /**
     * Get equipments by status
     * @param {string} status - Equipment status
     * @returns {Promise<Array<Equipment>>} Filtered equipments
     */
    async getByStatus(status) {
        try {
            const equipments = await this.getAllEquipments();
            return equipments.filter(eq => eq.status === status);
        } catch (error) {
            console.error(` Error fetching equipments by status ${status}:`, error);
            throw this.handleError(error, 'Failed to fetch equipments by status');
        }
    }

    /**
     * Get equipments that need attention
     * @returns {Promise<Array<Equipment>>} Equipments needing attention
     */
    async getEquipmentsNeedingAttention() {
        try {
            const equipments = await this.getAllEquipments();
            return equipments.filter(eq => eq.needsAttention());
        } catch (error) {
            console.error(' Error fetching equipments needing attention:', error);
            throw this.handleError(error, 'Failed to fetch equipments needing attention');
        }
    }


    /**
     * @deprecated Use getAllEquipments() directly
     */
    async getAll() {
        console.warn('️ getAll() is deprecated. Use getAllEquipments() instead.');
        return this.getAllEquipments();
    }

    /**
     * @deprecated Use Equipment instances directly, no mapping needed
     */
    mapEquipment(data) {
        console.warn(' mapEquipment() is deprecated. Service returns Equipment instances directly.');

        if (Array.isArray(data)) {
            return data.map(item => new Equipment(item));
        }
        return new Equipment(data);
    }
}