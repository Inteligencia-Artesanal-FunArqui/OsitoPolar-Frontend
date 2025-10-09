/**
 * @class DailyTemperatureAverage
 * @description Pure data entity for daily temperature statistics
 */
export class DailyTemperatureAverage {
    constructor({
                    id = '',
                    equipmentId = 0,
                    date = '',
                    averageTemperature = 0,
                    minTemperature = 0,
                    maxTemperature = 0
                }) {
        this.id = id;
        this.equipmentId = equipmentId;
        this.date = date;
        this.averageTemperature = averageTemperature;
        this.minTemperature = minTemperature;
        this.maxTemperature = maxTemperature;
    }
}