import httpInstance from "../../shared/http.instance.js";
import { RentalPrice } from "../models/rental-price.entity.js";

/**
 * @class RentalPricingService
 * @description Service for calculating rental prices
 */
export class RentalPricingService {
    /**
     * Get pricing for equipment
     * @param {string} equipmentId - Equipment ID
     * @returns {Promise} Promise that resolves to pricing data
     */
    getRentalPricing(equipmentId) {
        return httpInstance.get(`/rentalPricing?rentalEquipmentId=${equipmentId}`);
    }

    /**
     * Calculate total rental cost
     * @param {Object} params - Calculation parameters
     * @returns {Promise} Promise that resolves to cost breakdown
     */
    async calculateRentalCost({ equipmentId, quantity, months }) {
        // For now, calculate on frontend. Later this will be an API call
        const pricingResponse = await this.getRentalPricing(equipmentId);
        const pricing = pricingResponse.data[0]; // Get first pricing match

        if (!pricing) {
            throw new Error('No pricing found for this equipment');
        }

        const discount = this.getApplicableDiscount(months, pricing.discounts || []);
        const baseMonthly = pricing.baseMonthlyPrice * quantity;
        const discountedMonthly = this.calculateDiscountedPrice(baseMonthly, discount);
        const setupTotal = (pricing.setupFee + pricing.deliveryFee) * quantity;

        return {
            data: {
                monthlyPrice: discountedMonthly,
                totalMonthly: discountedMonthly * months,
                setupCost: setupTotal,
                discount: discount,
                firstPayment: discountedMonthly + setupTotal
            }
        };
    }

    /**
     * Get applicable discounts
     * @param {number} months - Rental period in months
     * @param {Array} discountTiers - Available discount tiers
     * @returns {number} Discount percentage
     */
    getApplicableDiscount(months, discountTiers) {
        const applicable = discountTiers
            .filter(tier => months >= tier.months)
            .sort((a, b) => b.percentage - a.percentage);

        return applicable.length > 0 ? applicable[0].percentage : 0;
    }

    /**
     * Format price for display
     * @param {number} price - Price value
     * @param {string} currency - Currency symbol
     * @returns {string} Formatted price
     */
    formatPrice(price, currency = '$') {
        return `${price.toFixed(2)} ${currency}`;
    }

    /**
     * Calculate monthly payment with discount
     * @param {number} basePrice - Base monthly price
     * @param {number} discountPercentage - Discount percentage
     * @returns {number} Final monthly price
     */
    calculateDiscountedPrice(basePrice, discountPercentage) {
        return basePrice * (1 - discountPercentage / 100);
    }
}