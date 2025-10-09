/**
 * @class RentalEquipment
 * @description Equipment available for rent from OsitoPolar
 */
export class RentalEquipment {
    constructor({
                    id = '',
                    name = '',
                    type = '',
                    model = '',
                    manufacturer = '',
                    monthlyPrice = 0,
                    currency = '$',
                    imageUrl = '',
                    isAvailable = true,
                    description = '',
                    technicalSpecs = '',
                    minimumRentalPeriod = 1, // in months
                    stock = 0,
                    features = []
                }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.model = model;
        this.manufacturer = manufacturer;
        this.monthlyPrice = monthlyPrice;
        this.currency = currency;
        this.imageUrl = imageUrl;
        this.isAvailable = isAvailable;
        this.description = description;
        this.technicalSpecs = technicalSpecs;
        this.minimumRentalPeriod = minimumRentalPeriod;
        this.stock = stock;
        this.features = features;
    }
}