import httpInstance from "../../shared/http.instance.js";
import { Technician } from "../models/technician.entity.js";

/**
 * @class TechnicianService
 * @description Service class for handling technician operations using HTTP requests
 */
export class TechnicianService {
    /**
     * Fetches all technicians from the server.
     * @returns {Promise} A promise resolving to an array of technicians.
     */
    getAll() {
        return httpInstance.get("/technicians");
    }

    /**
     * Fetches a specific technician by ID.
     * @param {number|string} id - The ID of the technician to retrieve.
     * @returns {Promise} A promise resolving to a technician object.
     */
    getById(id) {
        return httpInstance.get(`/technicians/${id}`);
    }

    /**
     * Sends a request to create a new technician.
     * @param {Object} technicianData - The data of the technician to be created.
     * @returns {Promise} A promise resolving to the created technician.
     */
    createTechnician(technicianData) {
        return httpInstance.post("/technicians", technicianData);
    }

    /**
     * Updates an existing technician.
     * @param {number|string} id - The ID of the technician to update.
     * @param {Object} technicianData - The updated data for the technician.
     * @returns {Promise} A promise resolving to the updated technician.
     */
    updateTechnician(id, technicianData) {
        return httpInstance.put(`/technicians/${id}`, technicianData);
    }

    /**
     * Deletes a technician by ID.
     * @param {number|string} id - The ID of the technician to delete.
     * @returns {Promise} A promise resolving when the technician is deleted.
     */
    deleteTechnician(id) {
        return httpInstance.delete(`/technicians/${id}`);
    }

    /**
     * Maps raw API response data to Technician entity instances.
     * @param {Array|Object} data - Raw response data from the API.
     * @returns {Array<Technician>|Technician} A mapped technician instance or array.
     */
    mapTechnicians(data) {
        if (Array.isArray(data)) {
            return data.map(item => new Technician(item));
        }
        return new Technician(data);
    }
}