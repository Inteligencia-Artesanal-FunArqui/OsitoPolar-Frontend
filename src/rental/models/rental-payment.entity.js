/**
 * @class RentalPayment
 * @description Payment records for rental contracts
 */
export class RentalPayment {
    constructor({
                    id = '',
                    rentalContractId = '',
                    amount = 0,
                    currency = '$',
                    type = 'monthly', // monthly, setup, delivery, penalty
                    status = 'pending', // pending, processing, completed, failed
                    stripePaymentIntentId = '',
                    dueDate = '',
                    paidDate = '',
                    billingPeriodStart = '',
                    billingPeriodEnd = '',
                    invoiceUrl = '',
                    createdAt = ''
                }) {
        this.id = id;
        this.rentalContractId = rentalContractId;
        this.amount = amount;
        this.currency = currency;
        this.type = type;
        this.status = status;
        this.stripePaymentIntentId = stripePaymentIntentId;
        this.dueDate = dueDate;
        this.paidDate = paidDate;
        this.billingPeriodStart = billingPeriodStart;
        this.billingPeriodEnd = billingPeriodEnd;
        this.invoiceUrl = invoiceUrl;
        this.createdAt = createdAt;
    }
}