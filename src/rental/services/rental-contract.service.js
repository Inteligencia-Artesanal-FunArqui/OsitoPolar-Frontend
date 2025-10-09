import httpInstance from "../../shared/http.instance.js";
import { RentalContract } from "../models/rental-contract.entity.js";

/**
 * @class RentalContractService
 * @description Service for managing rental contracts
 */
export class RentalContractService {
    /**
     * Get user's active contracts
     * @param {string} userId - User ID
     * @returns {Promise} Promise that resolves to contracts
     */
    getUserContracts(userId) {
        return httpInstance.get(`/api/rental-contracts?userId=${userId}&status=active`);
    }

    /**
     * Get contract details
     * @param {string} contractId - Contract ID
     * @returns {Promise} Promise that resolves to contract details
     */
    getContractById(contractId) {
        return httpInstance.get(`/api/rental-contracts/${contractId}`);
    }

    /**
     * Terminate contract early
     * @param {string} contractId - Contract ID
     * @param {Object} terminationData - Termination details
     * @returns {Promise} Promise that resolves to terminated contract
     */
    terminateContract(contractId, terminationData) {
        return httpInstance.post(`/api/rental-contracts/${contractId}/terminate`, terminationData);
    }

    /**
     * Extend contract period
     * @param {string} contractId - Contract ID
     * @param {number} additionalMonths - Months to extend
     * @returns {Promise} Promise that resolves to extended contract
     */
    extendContract(contractId, additionalMonths) {
        return httpInstance.post(`/api/rental-contracts/${contractId}/extend`, {
            additionalMonths
        });
    }

    /**
     * Map API response to RentalContract entities
     * @param {Array} data - Raw API data
     * @returns {Array<RentalContract>} Array of mapped entities
     */
    mapRentalContracts(data) {
        return data.map(item => new RentalContract(item));
    }
}