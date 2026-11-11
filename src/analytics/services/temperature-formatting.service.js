/**
 * @class TemperatureFormattingService
 * @description Service for formatting temperature-related data
 */
export class TemperatureFormattingService {
    /**
     * Format timestamp for chart display
     * @param {string} timestamp - ISO timestamp
     * @returns {string} Formatted time (HH:mm)
     */
    static formatTime(timestamp) {
        if (!timestamp) return '';

        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                return timestamp;
            }

            return date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch (error) {
            return timestamp;
        }
    }

    /**
     * Get day name from date
     * @param {string} date - Date string
     * @returns {string} Day name (Mon, Tue, etc.)
     */
    static getDayName(date, locale = 'en') {
        if (!date) return '';

        const dateObj = new Date(date);
        if (Number.isNaN(dateObj.getTime())) return '';
        // yyyy-MM-dd strings parse as UTC midnight, so read the weekday in UTC to avoid an off-by-one day
        return dateObj.toLocaleDateString(locale === 'es' ? 'es-PE' : 'en-US', { weekday: 'short', timeZone: 'UTC' });
    }
    /**
     * Format temperature with proper precision
     * @param {number} temperature - Temperature value
     * @param {number} decimals - Number of decimal places (default: 1)
     * @returns {number} Properly formatted temperature
     */
    static formatTemperature(temperature, decimals = 1) {
        return Number(temperature.toFixed(decimals));
    }
    /**
     * Get hour from timestamp
     * @param {string} timestamp - ISO timestamp
     * @returns {string} Hour (e.g., "10:00")
     */
    static getHour(timestamp) {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        return `${date.getHours()}:00`;
    }
}