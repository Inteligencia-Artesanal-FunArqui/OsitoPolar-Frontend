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
    static getDayName(date) {
        if (!date) return '';

        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dateObj = new Date(date);
        return days[dateObj.getDay()];
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