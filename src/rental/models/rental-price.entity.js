/**
 * @class RentalPrice
 * @description Pricing tiers for rental equipment
 */
export class RentalPrice {
    constructor({
                    id = '',
                    rentalEquipmentId = '',
                    baseMonthlyPrice = 0,
                    currency = '$',
                    discounts = [], // {months: 6, percentage: 10}
                    setupFee = 0,
                    deliveryFee = 0,
                    insuranceMonthlyFee = 0
                }) {
        this.id = id;
        this.rentalEquipmentId = rentalEquipmentId;
        this.baseMonthlyPrice = baseMonthlyPrice;
        this.currency = currency;
        this.discounts = discounts;
        this.setupFee = setupFee;
        this.deliveryFee = deliveryFee;
        this.insuranceMonthlyFee = insuranceMonthlyFee;
    }
}