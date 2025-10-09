/**
 * @fileoverview Entity class representing a subscription plan
 * Defines the structure for both user and provider plans
 */

export class Plan {
    /**
     * Creates a new Plan instance
     * @param {Object} options - Configuration object for the plan
     * @param {string} options.id - Unique identifier for the plan
     * @param {string} options.name - Name of the plan
     * @param {number} options.price - Price of the plan
     * @param {string} options.billingCycle - Billing cycle (e.g., 'monthly')
     * @param {number} options.maxEquipment - Maximum number of equipment units (for users)
     * @param {Array<string>} options.features - Array of feature descriptions
     */
    constructor({
                    id = ' ',
                    name = ' ',
                    price = 0,
                    billingCycle = ' ',
                    maxEquipment = 0,
                    features = [],
                }) {
        this.id = id;
        this.name = name;
        this.price = typeof price === 'string' ? parseFloat(price) || 0 : (price || 0);
        this.billingCycle = billingCycle;
        this.maxEquipment = typeof maxEquipment === 'string' ? parseInt(maxEquipment, 10) || 0 : (maxEquipment || 0);
        this.features = features;
    }
}