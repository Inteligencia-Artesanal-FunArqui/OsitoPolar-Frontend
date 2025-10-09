import httpInstance from "../../shared/http.instance.js";
import { RentalPayment } from "../models/rental-payment.entity.js";

/**
 * @class RentalPaymentService
 * @description Service for preparing payment data and communicating with backend
 * The actual payment processing is handled by the C# backend with Stripe
 */
export class RentalPaymentService {
    /**
     * Initialize payment session
     * @param {Object} paymentData - Payment initialization data
     * @returns {Promise} Promise that resolves to payment session info
     */
    initializePaymentSession(paymentData) {
        // For now, simulate the response. Backend will create Stripe session
        return Promise.resolve({
            data: {
                sessionId: 'sim_' + Date.now(),
                checkoutUrl: '#', // Backend will provide real Stripe URL
                amount: paymentData.amount,
                currency: paymentData.currency
            }
        });
    }

    /**
     * Get Stripe checkout URL
     * @param {string} rentalRequestId - Rental request ID
     * @returns {Promise} Promise that resolves to Stripe checkout URL
     */
    getCheckoutUrl(rentalRequestId) {
        // For now, simulate the response. Backend will create real Stripe checkout
        return Promise.resolve({
            data: {
                checkoutUrl: '#payment-simulation',
                sessionId: 'cs_test_' + Date.now()
            }
        });
    }

    /**
     * Verify payment status
     * @param {string} sessionId - Stripe session ID
     * @returns {Promise} Promise that resolves to payment status
     */
    verifyPaymentStatus(sessionId) {
        // Simulated response
        return Promise.resolve({
            data: {
                status: 'completed',
                paymentIntentId: 'pi_' + sessionId
            }
        });
    }

    /**
     * Get payment history for contract
     * @param {string} contractId - Contract ID
     * @returns {Promise} Promise that resolves to payment history
     */
    getContractPayments(contractId) {
        return httpInstance.get(`/rentalPayments?contractId=${contractId}`);
    }

    /**
     * Get upcoming payments
     * @param {string} userId - User ID
     * @returns {Promise} Promise that resolves to upcoming payments
     */
    getUpcomingPayments(userId) {
        // For json-server, get all payments for user and filter
        return httpInstance.get(`/rentalPayments?userId=${userId}&status=pending`);
    }

    /**
     * Request payment method update
     * @param {string} contractId - Contract ID
     * @returns {Promise} Promise that resolves to update session URL
     */
    requestPaymentMethodUpdate(contractId) {
        // Simulated response
        return Promise.resolve({
            data: {
                updateUrl: '#update-payment-method',
                sessionId: 'cs_update_' + Date.now()
            }
        });
    }

    /**
     * Download invoice
     * @param {string} paymentId - Payment ID
     * @returns {Promise} Promise that resolves to invoice download URL
     */
    getInvoiceUrl(paymentId) {
        // Simulated response
        return Promise.resolve({
            data: {
                invoiceUrl: '#',
                invoiceNumber: 'INV-' + paymentId
            }
        });
    }

    /**
     * Map API response to RentalPayment entities
     * @param {Array} data - Raw API data
     * @returns {Array<RentalPayment>} Array of mapped entities
     */
    mapRentalPayments(data) {
        return data.map(item => new RentalPayment(item));
    }
}