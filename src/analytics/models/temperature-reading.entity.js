/**
 * @class TemperatureReading
 * @description Represents a temperature reading entity with time and status
 * Used for tracking temperature measurements of refrigeration equipment
 */
export class TemperatureReading {
    /**
     * Creates a new TemperatureReading instance
     * @param {Object} params - The temperature reading initialization parameters
     * @param {string} [params.id=''] - Unique identifier for the reading
     * @param {number} [params.equipmentId=0] - ID of associated equipment
     * @param {number} [params.temperature=0] - Temperature value
     * @param {string} [params.timestamp=''] - Timestamp of the reading
     * @param {string} [params.status='normal'] - Status of this reading (normal, warning, critical)
     */
    constructor({
                    id = '',
                    equipmentId = 0,
                    temperature = 0,
                    timestamp = '',
                    status = 'normal'
                }) {
        this.id = id;
        this.equipmentId = equipmentId;
        this.temperature = temperature;
        this.timestamp = timestamp;
        this.status = status;
    }

}