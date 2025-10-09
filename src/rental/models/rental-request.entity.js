/**
 * @class RentalRequest
 * @description Customer rental request before conversion to contract
 */
export class RentalRequest {
    constructor({
                    id = '',
                    userId = '',
                    rentalEquipmentId = '',
                    quantity = 1,
                    rentalPeriodMonths = 1,
                    deliveryAddress = '',
                    preferredStartDate = '',
                    notes = '',
                    status = 'draft',
                    totalMonthlyPrice = 0,
                    totalSetupCost = 0,
                    createdAt = '',
                    updatedAt = ''
                }) {
        this.id = id;
        this.userId = userId;
        this.rentalEquipmentId = rentalEquipmentId;
        this.quantity = quantity;
        this.rentalPeriodMonths = rentalPeriodMonths;
        this.deliveryAddress = deliveryAddress;
        this.preferredStartDate = preferredStartDate;
        this.notes = notes;
        this.status = status;
        this.totalMonthlyPrice = totalMonthlyPrice;
        this.totalSetupCost = totalSetupCost;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}