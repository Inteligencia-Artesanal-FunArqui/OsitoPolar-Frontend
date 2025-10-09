import httpInstance from "../../shared/http.instance.js";

/**
 * @class AnalyticsService
 * @description Service for analytics operations with C# backend
 */
export class AnalyticsService {
    constructor() {
        this.baseUrl = '/analytics/equipments';
    }

    /**
     * Get equipment readings (temperature, energy, or all)
     * @param {number} equipmentId - Equipment ID
     * @param {string} type - Reading type ('temperature', 'energy', 'all')
     * @param {number} hours - Time range in hours (default: 24)
     * @param {number} limit - Maximum number of readings (default: 100)
     * @returns {Promise<Object>} Readings data
     */
    async getEquipmentReadings(equipmentId, type = 'temperature', hours = 24, limit = 100) {
        try {
            const params = new URLSearchParams({
                type: type,
                hours: hours.toString(),
                limit: limit.toString()
            });

            const response = await httpInstance.get(`${this.baseUrl}/${equipmentId}/readings?${params}`);

            console.log(`📊 Analytics - Equipment ${equipmentId} readings (${type}):`, response.data);
            return response;

        } catch (error) {
            console.error(`Error fetching equipment ${equipmentId} readings:`, error);
            throw this.handleError(error, 'Failed to fetch equipment readings');
        }
    }
    async loadPreviewData() {
        try {
            this.loadingAnalytics = true;

            const response = await this.analyticsService.getEquipmentReadings(this.equipment.id, 'temperature', 24, 9);
            if (response.data && response.data.data) {
                this.readings = response.data.data.slice(0, 9);
            }

            if (response.data && response.data.data && response.data.data.length > 0) {
                this.readings = response.data.data.slice(0, 9);
                console.log(' Temperature readings loaded:', this.readings.length, 'items');
            } else {
                this.readings = [];
                console.log('ℹ️ No temperature readings available for equipment', this.equipment.id);
            }

        } catch (error) {
            console.error('Error loading temperature data:', error);
            this.readings = [];
        } finally {
            this.loadingAnalytics = false;
        }
    }
    /**
     * Get equipment summaries (daily averages, trends)
     * @param {number} equipmentId - Equipment ID
     * @param {string} type - Summary type ('daily-averages', 'trends')
     * @param {number} days - Number of days (default: 7)
     * @returns {Promise<Object>} Summaries data
     */
    async getEquipmentSummaries(equipmentId, type = 'daily-averages', days = 7) {
        try {
            const params = new URLSearchParams({
                type: type,
                days: days.toString()
            });

            const response = await httpInstance.get(`${this.baseUrl}/${equipmentId}/summaries?${params}`);

            return response;

        } catch (error) {
            console.error(`Error fetching equipment ${equipmentId} summaries:`, error);
            throw this.handleError(error, 'Failed to fetch equipment summaries');
        }
    }

    /**
     * Get multiple equipments overview
     * @param {Array|string} equipmentIds - Array of IDs or comma-separated string
     * @param {string} type - Overview type ('current', 'summary')
     * @returns {Promise<Object>} Overview data
     */
    async getEquipmentsOverview(equipmentIds, type = 'current') {
        try {
            const ids = Array.isArray(equipmentIds)
                ? equipmentIds.join(',')
                : equipmentIds.toString();

            const params = new URLSearchParams({
                ids: ids,
                type: type
            });

            const response = await httpInstance.get(`${this.baseUrl}/overview?${params}`);

            console.log(`🎛️ Analytics - Overview for equipments [${ids}]:`, response.data);
            return response;

        } catch (error) {
            console.error('Error fetching equipments overview:', error);
            throw this.handleError(error, 'Failed to fetch equipments overview');
        }
    }

    /**
     * @deprecated Use getEquipmentReadings with type='temperature'
     */
    async getTemperatureReadings(equipmentId, limit = 24) {
        console.warn('getTemperatureReadings is deprecated. Use getEquipmentReadings instead.');

        try {
            const response = await this.getEquipmentReadings(equipmentId, 'temperature', limit);

            // Transform to old format for compatibility
            if (response.data?.data) {
                const temperatureReadings = response.data.data
                    .filter(reading => reading.type === 'temperature')
                    .map(reading => ({
                        id: reading.id,
                        equipmentId: reading.equipmentId,
                        temperature: reading.value,
                        timestamp: reading.timestamp,
                        status: reading.status
                    }));

                return { ...response, data: temperatureReadings };
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * @deprecated Use getEquipmentSummaries with type='daily-averages'
     */
    async getDailyTemperatureAverages(equipmentId, limit = 7) {
        console.warn('getDailyTemperatureAverages is deprecated. Use getEquipmentSummaries instead.');

        try {
            const response = await this.getEquipmentSummaries(equipmentId, 'daily-averages', limit);

            // Transform to old format for compatibility
            if (response.data?.data) {
                const dailyAverages = response.data.data.map(summary => ({
                    id: summary.id,
                    equipmentId: summary.equipmentId,
                    date: summary.date,
                    averageTemperature: summary.averageTemperature,
                    minTemperature: summary.minTemperature,
                    maxTemperature: summary.maxTemperature
                }));

                return { ...response, data: dailyAverages };
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Handle and format API errors
     * @param {Error} error - Original error
     * @param {string} defaultMessage - Default error message
     * @returns {Error} Formatted error
     */
    handleError(error, defaultMessage) {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || defaultMessage;

            switch (status) {
                case 400:
                    return new Error(`Invalid request: ${message}`);
                case 401:
                    return new Error('Unauthorized access');
                case 403:
                    return new Error('Access forbidden');
                case 404:
                    return new Error('Equipment not found');
                case 500:
                    return new Error('Server error. Please try again later.');
                default:
                    return new Error(`Error ${status}: ${message}`);
            }
        } else if (error.request) {
            return new Error('Network error. Please check your connection.');
        } else {
            return new Error(error.message || defaultMessage);
        }
    }

    /**
     * Transform readings data for charts
     * @param {Array} readings - Raw readings data
     * @returns {Array} Transformed readings
     */
    transformReadingsForChart(readings) {
        if (!Array.isArray(readings)) return [];

        return readings.map(reading => ({
            x: reading.timestamp,
            y: reading.value || reading.temperature,
            status: reading.status
        }));
    }

    /**
     * Transform summaries data for charts
     * @param {Array} summaries - Raw summaries data
     * @returns {Array} Transformed summaries
     */
    transformSummariesForChart(summaries) {
        if (!Array.isArray(summaries)) return [];

        return summaries.map(summary => ({
            date: summary.date,
            average: summary.averageTemperature,
            min: summary.minTemperature,
            max: summary.maxTemperature
        }));
    }

    /**
     * Get status color for readings
     * @param {string} status - Reading status
     * @returns {string} CSS color
     */
    getStatusColor(status) {
        const colors = {
            'normal': '#28a745',
            'warning': '#ffc107',
            'critical': '#dc3545'
        };
        return colors[status] || colors.normal;
    }
}