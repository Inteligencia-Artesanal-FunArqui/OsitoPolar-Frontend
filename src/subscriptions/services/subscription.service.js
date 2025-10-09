import httpInstance from '../../shared/http.instance.js';
import { Plan } from '../models/plan.entity.js';

class SubscriptionService {
    constructor() {
        this.baseUrl = '/subscriptions';
        this.paymentsUrl = '/payments';
    }

    /**
     * Get all plans for a specific user type
     * @param {string} userType - 'user' or 'prvider'
     * @returns {Promise<Plan[]>}
     */
    async getPlans(userType) {
        try {
            const response = await httpInstance.get(`${this.baseUrl}?userType=${userType}`);
            return response.data.map(planData => new Plan({
                id: planData.id,
                name: planData.planName, // Mapear planName a name
                price: planData.price,
                billingCycle: planData.billingCycle,
                maxEquipment: planData.maxEquipment,
                maxClients: planData.maxClients,
                features: planData.features
            }));
        } catch (error) {
            console.error('Error fetching plans:', error);
            throw error;
        }
    }

    /**
     * Get subscription by ID
     * @param {number} subscriptionId
     * @returns {Promise<Plan>}
     */
    async getSubscriptionById(subscriptionId) {
        try {
            const response = await httpInstance.get(`${this.baseUrl}/${subscriptionId}`);
            const planData = response.data;
            return new Plan({
                id: planData.id,
                name: planData.planName,
                price: planData.price,
                billingCycle: planData.billingCycle,
                maxEquipment: planData.maxEquipment,
                maxClients: planData.maxClients,
                features: planData.features
            });
        } catch (error) {
            console.error('Error fetching subscription:', error);
            throw error;
        }
    }

    /**
     * Create Stripe checkout session and redirect to Stripe
     * @param {number} userId
     * @param {number} planId
     * @param {string} successUrl - Optional custom success URL
     * @param {string} cancelUrl - Optional custom cancel URL
     * @returns {Promise<void>} - Redirects to Stripe, doesn't return
     */
    async createCheckoutSession(userId, planId, successUrl = null, cancelUrl = null) {
        try {
            const payload = {
                userId: userId,
                planId: planId,
                successUrl: successUrl,
                cancelUrl: cancelUrl
            };

            console.log('Creating Stripe checkout session:', payload);

            const response = await httpInstance.post(`${this.paymentsUrl}/create-checkout-session`, payload);

            const { checkoutUrl, sessionId, paymentId } = response.data;

            console.log('Checkout session created:', { checkoutUrl, sessionId, paymentId });

            // Redirect to Stripe Checkout
            window.location.href = checkoutUrl;

        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }
    }

    /**
     * Upgrade subscription directly (without Stripe - for testing)
     * @param {number} userId
     * @param {number} planId
     * @returns {Promise<Plan>}
     */
    async upgradePlan(userId, planId) {
        try {
            const response = await httpInstance.post(`${this.baseUrl}/upgrade`, {
                userId: userId,
                planId: planId
            });

            const planData = response.data;
            return new Plan({
                id: planData.id,
                name: planData.planName,
                price: planData.price,
                billingCycle: planData.billingCycle,
                maxEquipment: planData.maxEquipment,
                maxClients: planData.maxClients,
                features: planData.features
            });
        } catch (error) {
            console.error('Error upgrading plan:', error);
            throw error;
        }
    }

    /**
     * Process successful payment return from Stripe
     * @param {string} sessionId - Stripe session ID from URL params
     * @returns {Promise<boolean>}
     */
    async processPaymentSuccess(sessionId) {
        try {
            // In a real app, you might want to verify the payment status
            // For now, we'll just return true since the webhook handles the actual processing
            console.log('Payment successful for session:', sessionId);
            return true;
        } catch (error) {
            console.error('Error processing payment success:', error);
            return false;
        }
    }

    /**
     * Handle payment cancellation
     * @returns {Promise<boolean>}
     */
    async processPaymentCancellation() {
        console.log('Payment was cancelled by user');
        return true;
    }
}

export const subscriptionService = new SubscriptionService();