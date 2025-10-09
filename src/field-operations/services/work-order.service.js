import httpInstance from "../../shared/http.instance.js";
import { WorkOrder } from "../models/work-order.entity.js";

/**
 * @class WorkOrderService
 * @description Service class for handling work order operations using HTTP requests
 */
export class WorkOrderService {
    /**
     * Fetches all work orders from the server.
     * @returns {Promise} A promise resolving to an array of work orders.
     */
    getAll() {
        return httpInstance.get("/workOrders");
    }

    /**
     * Fetches a specific work order by ID.
     * @param {number|string} id - The ID of the work order to retrieve.
     * @returns {Promise} A promise resolving to a work order object.
     */
    getById(id) {
        return httpInstance.get(`/workOrders/${id}`);
    }

    /**
     * Sends a request to create a new work order.
     * @param {Object} workOrderData - The data of the work order to be created.
     * @returns {Promise} A promise resolving to the created work order.
     */
    createWorkOrder(workOrderData) {
        return httpInstance.post("/workOrders", workOrderData);
    }

    /**
     * Updates an existing work order.
     * @param {number|string} id - The ID of the work order to update.
     * @param {Object} workOrderData - The updated data for the work order.
     * @returns {Promise} A promise resolving to the updated work order.
     */
    updateWorkOrder(id, workOrderData) {
        return httpInstance.put(`/workOrders/${id}`, workOrderData);
    }

    /**
     * Deletes a work order by ID.
     * @param {number|string} id - The ID of the work order to delete.
     * @returns {Promise} A promise resolving when the work order is deleted.
     */
    deleteWorkOrder(id) {
        return httpInstance.delete(`/workOrders/${id}`);
    }

    /**
     * Assigns a technician to a work order.
     * @param {number|string} workOrderId - The ID of the work order.
     * @param {number|string} technicianId - The ID of the technician to assign.
     * @returns {Promise} A promise resolving to the updated work order.
     */
    assignTechnician(workOrderId, technicianId) {
        return httpInstance.put(`/workOrders/${workOrderId}/technician`, { technicianId });
    }

    /**
     * Updates the status of a work order.
     * @param {number|string} workOrderId - The ID of the work order.
     * @param {string} newStatus - The new status (e.g., 'in_progress', 'resolved').
     * @returns {Promise} A promise resolving to the updated work order.
     */
    updateStatus(workOrderId, newStatus) {
        return httpInstance.put(`/workOrders/${workOrderId}/status`, { newStatus });
    }

    /**
     * Adds resolution details to a work order.
     * @param {number|string} workOrderId - The ID of the work order.
     * @param {Object} resolutionData - Object containing resolutionDetails, technicianNotes, and cost.
     * @returns {Promise} A promise resolving to the updated work order.
     */
    addResolutionDetails(workOrderId, resolutionData) {
        return httpInstance.put(`/workOrders/${workOrderId}/resolution`, resolutionData);
    }

    /**
     * Retrieves work orders filtered by technician ID.
     * @param {number|string} technicianId - The ID of the technician to filter by.
     * @returns {Promise} A promise resolving to a filtered list of work orders.
     */
    getByTechnicianId(technicianId) {
        return httpInstance.get(`/workOrders?assignedTechnicianId=${technicianId}`);
    }

    /**
     * Maps raw API response data to WorkOrder entity instances.
     * @param {Array|Object} data - Raw response data from the API.
     * @returns {Array<WorkOrder>|WorkOrder} A mapped work order instance or array.
     */
    mapWorkOrders(data) {
        if (Array.isArray(data)) {
            return data.map(item => new WorkOrder(item));
        }
        return new WorkOrder(data);
    }
}