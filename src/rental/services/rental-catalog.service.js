import httpInstance from "../../shared/http.instance.js";
import { RentalEquipment } from "../models/rental-equipment.entity.js";

/**
 * @class RentalCatalogService
 * @description Service for managing rental equipment catalog
 */
export class RentalCatalogService {
    /**
     * Get all available rental equipment
     * @returns {Promise} Promise that resolves to array of equipment
     */
    getAllRentalEquipment() {
        return httpInstance.get('/rentalEquipment?isAvailable=true');
    }

    /**
     * Get rental equipment by type
     * @param {string} type - Equipment type
     * @returns {Promise} Promise that resolves to filtered equipment
     */
    getRentalEquipmentByType(type) {
        return httpInstance.get(`/rentalEquipment?type=${type}&isAvailable=true`);
    }

    /**
     * Get rental equipment details
     * @param {string} equipmentId - Equipment ID
     * @returns {Promise} Promise that resolves to equipment details
     */
    getRentalEquipmentById(equipmentId) {
        return httpInstance.get(`/rentalEquipment/${equipmentId}`);
    }

    /**
     * Search rental equipment
     * @param {Object} filters - Search filters
     * @returns {Promise} Promise that resolves to search results
     */
    searchRentalEquipment(filters) {
        const params = new URLSearchParams(filters);
        return httpInstance.get(`/rentalEquipment?${params}`);
    }

    /**
     * Map API response to RentalEquipment entities
     * @param {Array} data - Raw API data
     * @returns {Array<RentalEquipment>} Array of mapped entities
     */
    mapRentalEquipment(data) {
        return data.map(item => new RentalEquipment(item));
    }
}