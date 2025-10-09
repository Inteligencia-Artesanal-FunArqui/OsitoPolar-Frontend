/**
 * @class Technician
 * @description Entity class representing a technician record, aligned with the backend model.
 */
export class Technician {
    /**
     * @param {Object} [data={}] - Raw data object from the API response for a Technician.
     * @param {number} [data.id=0] - Unique identifier for the technician.
     * @param {string} [data.name=''] - Full name of the technician.
     * @param {string} [data.specialization=''] - Primary area of expertise of the technician.
     * @param {string} [data.phone=''] - Contact phone number of the technician.
     * @param {string} [data.email=''] - Email address of the technician.
     * @param {number} [data.averageRating=0.0] - The average rating received by the technician.
     * @param {string} [data.availability='Unknown'] - Current availability status (e.g., "Available", "Occupied").
     * @param {number} [data.companyId=0] - ID of the company the technician belongs to.
     */
    constructor({
                    id = 0,
                    name = '',
                    specialization = '',
                    phone = '',
                    email = '',
                    averageRating = 0.0,
                    availability = 'Unknown',
                    companyId = 0
                } = {}) {
        this.id = id;
        this.name = name;
        this.specialization = specialization;
        this.phone = phone;
        this.email = email;
        this.averageRating = averageRating;
        this.availability = availability;
        this.companyId = companyId;
    }

    /**
     * Returns a formatted string indicating availability.
     * @returns {string} The availability status string.
     */
    getAvailabilityStatus() {
        return this.availability;
    }

    /**
     * Returns a CSS class based on the availability status from the backend.
     * You'll need to define these CSS classes in your stylesheet.
     * @returns {string} A CSS class (e.g., "status-available", "status-occupied").
     */
    getAvailabilityClass() {
        switch (this.availability.toLowerCase()) {
            case 'available':
                return 'status-available';
            case 'occupied':
                return 'status-occupied';
            case 'on leave':
                return 'status-on-leave';
            default:
                return 'status-unknown';
        }
    }

    /**
     * Returns the formatted average rating of the technician.
     * @returns {string} Average rating formatted as "X.X / 5" or "N/A".
     */
    getAverageRating() {
        return this.averageRating > 0 ? `${this.averageRating.toFixed(1)} / 5` : 'N/A';
    }
}