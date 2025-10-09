/**
 * @class RentalContract
 * @description Active rental contract after approval
 */
export class RentalContract {
    constructor({
                    id = '',
                    userId = '',
                    rentalRequestId = '',
                    contractNumber = '',
                    startDate = '',
                    endDate = '',
                    monthlyPrice = 0,
                    status = 'active', // active, paused, terminated, completed
                    paymentMethod = '', // stripe_card, bank_transfer
                    stripeCustomerId = '',
                    stripeSubscriptionId = '',
                    equipmentDelivered = false,
                    deliveryDate = '',
                    createdAt = '',
                    updatedAt = ''
                }) {
        this.id = id;
        this.userId = userId;
        this.rentalRequestId = rentalRequestId;
        this.contractNumber = contractNumber;
        this.startDate = startDate;
        this.endDate = endDate;
        this.monthlyPrice = monthlyPrice;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.stripeCustomerId = stripeCustomerId;
        this.stripeSubscriptionId = stripeSubscriptionId;
        this.equipmentDelivered = equipmentDelivered;
        this.deliveryDate = deliveryDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}