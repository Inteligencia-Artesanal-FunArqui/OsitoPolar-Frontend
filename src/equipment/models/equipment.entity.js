/**
 * @class Equipment
 * @description Equipment entity matching C# API response format
 * Represents refrigeration equipment with direct API compatibility
 */
export class Equipment {
    /**
     * Creates a new Equipment instance matching C# API structure
     * @param {Object} params - Equipment data directly from C# API
     */
    constructor({
                    id = 0,
                    name = '',
                    type = '',
                    model = '',
                    manufacturer = '',
                    serialNumber = '',
                    code = '',
                    cost = 0,
                    technicalDetails = '',
                    status = 'active',
                    isPoweredOn = false,
                    installationDate = '',
                    notes = '',

                    currentTemperature = 0,
                    setTemperature = 0,
                    optimalTemperatureMin = 0,
                    optimalTemperatureMax = 0,

                    locationName = '',
                    locationAddress = '',
                    locationLatitude = 0,
                    locationLongitude = 0,

                    energyConsumptionCurrent = 0,
                    energyConsumptionUnit = 'watts',
                    energyConsumptionAverage = 0,

                    ownerId = 0,
                    ownerType = '',
                    ownershipType = 'owned'
                }) {

        this.id = id;
        this.name = name;
        this.type = type;
        this.model = model;
        this.manufacturer = manufacturer;
        this.serialNumber = serialNumber;
        this.code = code;
        this.cost = cost;
        this.technicalDetails = technicalDetails;
        this.status = status;
        this.isPoweredOn = isPoweredOn;
        this.installationDate = installationDate;
        this.notes = notes;


        this.currentTemperature = currentTemperature;
        this.setTemperature = setTemperature;
        this.optimalTemperatureMin = optimalTemperatureMin;
        this.optimalTemperatureMax = optimalTemperatureMax;


        this.locationName = locationName;
        this.locationAddress = locationAddress;
        this.locationLatitude = locationLatitude;
        this.locationLongitude = locationLongitude;


        this.energyConsumptionCurrent = energyConsumptionCurrent;
        this.energyConsumptionUnit = energyConsumptionUnit;
        this.energyConsumptionAverage = energyConsumptionAverage;


        this.ownerId = ownerId;
        this.ownerType = ownerType;
        this.ownershipType = ownershipType;
    }

    /**
     * Getter para compatibilidad con código existente
     * @returns {Object} Location object in expected format
     */
    get location() {
        return {
            name: this.locationName,
            address: this.locationAddress,
            coordinates: {
                lat: this.locationLatitude,
                lng: this.locationLongitude
            }
        };
    }

    /**
     * Getter para compatibilidad con código existente
     * @returns {Object} Energy consumption object
     */
    get energyConsumption() {
        return {
            current: this.energyConsumptionCurrent,
            unit: this.energyConsumptionUnit,
            average: this.energyConsumptionAverage
        };
    }

    /**
     * Check if temperature is within optimal range
     * @returns {string} Status: 'normal', 'warning', or 'critical'
     */
    getTemperatureStatus() {
        if (this.currentTemperature < this.optimalTemperatureMin ||
            this.currentTemperature > this.optimalTemperatureMax) {

            const minDiff = Math.abs(this.currentTemperature - this.optimalTemperatureMin);
            const maxDiff = Math.abs(this.currentTemperature - this.optimalTemperatureMax);
            const threshold = Math.abs(this.optimalTemperatureMax - this.optimalTemperatureMin) * 0.2;

            if (minDiff > threshold || maxDiff > threshold) {
                return 'critical';
            }
            return 'warning';
        }
        return 'normal';
    }

    /**
     * Gets color based on temperature status
     * @returns {string} CSS color value
     */
    getStatusColor() {
        const tempStatus = this.getTemperatureStatus();
        switch(tempStatus) {
            case 'critical': return '#FF5252';
            case 'warning': return '#FFC107';
            default: return '#4CAF50';
        }
    }

    /**
     * Gets CSS class for temperature status
     * @returns {string} CSS class name
     */
    getTemperatureStatusClass() {
        const tempStatus = this.getTemperatureStatus();
        return `temp-${tempStatus}`;
    }

    /**
     * Gets formatted installation date
     * @returns {string} Formatted date
     */
    getFormattedInstallationDate() {
        if (!this.installationDate) return 'Not available';
        try {
            return new Date(this.installationDate).toLocaleDateString();
        } catch (error) {
            return 'Invalid date';
        }
    }

    /**
     * Gets equipment type display text
     * @returns {string} Formatted equipment type
     */
    getTypeDisplay() {
        const typeMap = {
            'freezer': 'Freezer',
            'cold_room': 'Cold Room',
            'refrigerator': 'Refrigerator',
            'cooler': 'Cooler',
            'air_conditioner': 'Air Conditioner'
        };
        return typeMap[this.type] || this.type;
    }

    /**
     * Gets equipment status display text
     * @returns {string} Formatted status
     */
    getStatusDisplay() {
        const statusMap = {
            'active': 'Active',
            'inactive': 'Inactive',
            'maintenance': 'Under Maintenance',
            'error': 'Error'
        };
        return statusMap[this.status] || this.status;
    }

    /**
     * Gets equipment status CSS class
     * @returns {string} CSS class for status
     */
    getStatusClass() {
        const classMap = {
            'active': 'status-active',
            'inactive': 'status-inactive',
            'maintenance': 'status-maintenance',
            'error': 'status-error'
        };
        return classMap[this.status] || 'status-unknown';
    }

    /**
     * Check if equipment is operational
     * @returns {boolean} Whether equipment is working
     */
    isOperational() {
        return this.status === 'active' && this.isPoweredOn;
    }

    /**
     * Check if equipment needs attention
     * @returns {boolean} Whether equipment needs attention
     */
    needsAttention() {
        return this.getTemperatureStatus() !== 'normal' ||
            this.status === 'error' ||
            this.status === 'maintenance';
    }

    /**
     * Get equipment summary for display
     * @returns {Object} Summary object
     */
    getSummary() {
        return {
            id: this.id,
            name: this.name,
            type: this.getTypeDisplay(),
            status: this.getStatusDisplay(),
            temperature: `${this.currentTemperature}°C`,
            location: this.locationName,
            temperatureStatus: this.getTemperatureStatus(),
            isOperational: this.isOperational(),
            needsAttention: this.needsAttention()
        };
    }

    /**
     * Convert to API format for updates
     * @returns {Object} API-compatible object
     */
    toApiFormat() {
        return {
            name: this.name,
            type: this.type,
            model: this.model,
            manufacturer: this.manufacturer,
            serialNumber: this.serialNumber,
            code: this.code,
            cost: this.cost,
            technicalDetails: this.technicalDetails,
            currentTemperature: this.currentTemperature,
            setTemperature: this.setTemperature,
            optimalTemperatureMin: this.optimalTemperatureMin,
            optimalTemperatureMax: this.optimalTemperatureMax,
            locationName: this.locationName,
            locationAddress: this.locationAddress,
            locationLatitude: this.locationLatitude,
            locationLongitude: this.locationLongitude,
            energyConsumptionCurrent: this.energyConsumptionCurrent,
            energyConsumptionUnit: this.energyConsumptionUnit,
            energyConsumptionAverage: this.energyConsumptionAverage,
            ownerId: this.ownerId,
            ownerType: this.ownerType,
            ownershipType: this.ownershipType,
            notes: this.notes
        };
    }

    /**
     * Validate equipment data
     * @returns {Object} Validation result
     */
    validate() {
        const errors = [];

        if (!this.name?.trim()) {
            errors.push('Equipment name is required');
        }

        if (!this.type?.trim()) {
            errors.push('Equipment type is required');
        }

        if (!this.serialNumber?.trim()) {
            errors.push('Serial number is required');
        }

        if (!this.ownerId) {
            errors.push('Owner ID is required');
        }

        if (this.currentTemperature && this.optimalTemperatureMin &&
            this.currentTemperature < this.optimalTemperatureMin - 10) {
            errors.push('Current temperature is extremely low');
        }

        if (this.currentTemperature && this.optimalTemperatureMax &&
            this.currentTemperature > this.optimalTemperatureMax + 10) {
            errors.push('Current temperature is extremely high');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings: []
        };
    }

    /**
     * Update equipment properties
     * @param {Object} updates - Properties to update
     */
    update(updates) {
        Object.keys(updates).forEach(key => {
            if (this.hasOwnProperty(key)) {
                this[key] = updates[key];
            }
        });
    }

    /**
     * Clone equipment instance
     * @returns {Equipment} New equipment instance
     */
    clone() {
        return new Equipment({
            id: this.id,
            name: this.name,
            type: this.type,
            model: this.model,
            manufacturer: this.manufacturer,
            serialNumber: this.serialNumber,
            code: this.code,
            cost: this.cost,
            technicalDetails: this.technicalDetails,
            status: this.status,
            isPoweredOn: this.isPoweredOn,
            installationDate: this.installationDate,
            notes: this.notes,
            currentTemperature: this.currentTemperature,
            setTemperature: this.setTemperature,
            optimalTemperatureMin: this.optimalTemperatureMin,
            optimalTemperatureMax: this.optimalTemperatureMax,
            locationName: this.locationName,
            locationAddress: this.locationAddress,
            locationLatitude: this.locationLatitude,
            locationLongitude: this.locationLongitude,
            energyConsumptionCurrent: this.energyConsumptionCurrent,
            energyConsumptionUnit: this.energyConsumptionUnit,
            energyConsumptionAverage: this.energyConsumptionAverage,
            ownerId: this.ownerId,
            ownerType: this.ownerType,
            ownershipType: this.ownershipType
        });
    }
}