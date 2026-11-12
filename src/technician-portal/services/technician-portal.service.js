import httpInstance from '../../shared/http.instance.js';
import authService from '../../iam/services/auth.service.js';

/**
 * @class TechnicianPortalService
 * @description Everything the technician shell needs. The backend identifies the technician from the Bearer token,
 * so there are no ids in these URLs (lowkey the nicest part of the contract).
 */
class TechnicianPortalService {
    constructor() { this._base = '/technician/me'; }

    getDashboard() { return httpInstance.get(`${this._base}/dashboard`).then(r => r.data); }

    /** @param {string} [status] work order status, or 'all' / empty for everything */
    getWorkOrders(status = '') {
        return httpInstance.get(`${this._base}/work-orders`, { params: status && status !== 'all' ? { status } : {} }).then(r => r.data);
    }

    /** The list endpoint is tiny, so the detail page just picks its order from it. */
    async getWorkOrder(id) {
        const orders = await this.getWorkOrders();
        return orders.find(o => String(o.id) === String(id)) || null;
    }

    /** @param {{status?: string, technicianNotes?: string, resolutionDetails?: string, checklist?: {id: string, done: boolean}[]}} payload */
    updateWorkOrder(id, payload) { return httpInstance.patch(`${this._base}/work-orders/${id}`, payload).then(r => r.data); }

    getEquipment() { return httpInstance.get(`${this._base}/equipment`).then(r => r.data); }
    getInventory() { return httpInstance.get(`${this._base}/inventory`).then(r => r.data); }
    getHistory() { return httpInstance.get(`${this._base}/history`).then(r => r.data); }

    /** GET /users/{id}: technician-shaped profile. */
    getProfile() {
        const user = authService.getCurrentUser();
        return authService.getUserProfile(user?.id);
    }
}

export default new TechnicianPortalService();
