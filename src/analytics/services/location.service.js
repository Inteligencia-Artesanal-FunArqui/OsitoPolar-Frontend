/**
 * @service LocationService
 * @description Service for handling geolocation operations
 */
export class LocationService {
    constructor() {
        this.currentLocation = null;
        this.watchId = null;
        this.listeners = new Set();
    }

    /**
     * Check if geolocation is supported
     * @returns {boolean}
     */
    isGeolocationSupported() {
        return 'geolocation' in navigator;
    }

    /**
     * Get current position
     * @param {Object} options - Geolocation options
     * @returns {Promise<Object>} Position object
     */
    getCurrentPosition(options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.isGeolocationSupported()) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            const defaultOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes cache
            };

            const geoOptions = { ...defaultOptions, ...options };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: Date.now()
                    };

                    this.notifyListeners('location-detected', this.currentLocation);
                    resolve(this.currentLocation);
                },
                (error) => {
                    const errorInfo = this.parseGeolocationError(error);
                    this.notifyListeners('location-error', errorInfo);
                    reject(errorInfo);
                },
                geoOptions
            );
        });
    }

    /**
     * Watch position changes
     * @param {Object} options - Geolocation options
     * @returns {number} Watch ID
     */
    watchPosition(options = {}) {
        if (!this.isGeolocationSupported()) {
            throw new Error('Geolocation is not supported');
        }

        if (this.watchId !== null) {
            this.clearWatch();
        }

        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000 // 1 minute cache for watch
        };

        const geoOptions = { ...defaultOptions, ...options };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: Date.now()
                };

                this.notifyListeners('location-updated', this.currentLocation);
            },
            (error) => {
                const errorInfo = this.parseGeolocationError(error);
                this.notifyListeners('location-error', errorInfo);
            },
            geoOptions
        );

        return this.watchId;
    }

    /**
     * Clear position watch
     */
    clearWatch() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    /**
     * Parse geolocation error
     * @param {GeolocationPositionError} error
     * @returns {Object} Error information
     */
    parseGeolocationError(error) {
        const errorMap = {
            [error.PERMISSION_DENIED]: {
                code: 'PERMISSION_DENIED',
                message: 'Location access denied by user',
                userMessage: 'Please allow location access to use this feature'
            },
            [error.POSITION_UNAVAILABLE]: {
                code: 'POSITION_UNAVAILABLE',
                message: 'Location information unavailable',
                userMessage: 'Unable to determine your location'
            },
            [error.TIMEOUT]: {
                code: 'TIMEOUT',
                message: 'Location request timed out',
                userMessage: 'Location request took too long, please try again'
            }
        };

        return errorMap[error.code] || {
            code: 'UNKNOWN_ERROR',
            message: 'Unknown geolocation error',
            userMessage: 'An unexpected error occurred while getting your location'
        };
    }

    /**
     * Calculate distance between two points using Haversine formula
     * @param {Object} point1 - {lat, lng}
     * @param {Object} point2 - {lat, lng}
     * @returns {number} Distance in meters
     */
    calculateDistance(point1, point2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = point1.lat * Math.PI / 180;
        const φ2 = point2.lat * Math.PI / 180;
        const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
        const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    }

    /**
     * Find nearest point from a list
     * @param {Object} userLocation - {lat, lng}
     * @param {Array} points - Array of objects with lat/lng
     * @returns {Object} Nearest point with distance
     */
    findNearest(userLocation, points) {
        if (!userLocation || !points.length) return null;

        let nearest = null;
        let shortestDistance = Infinity;

        points.forEach(point => {
            const distance = this.calculateDistance(userLocation, {
                lat: point.lat || point.coordinates?.lat,
                lng: point.lng || point.coordinates?.lng
            });

            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearest = { ...point, distance };
            }
        });

        return nearest;
    }

    /**
     * Convert coordinates to Google Maps URL
     * @param {Object} location - {lat, lng}
     * @param {number} zoom - Zoom level
     * @returns {string} Google Maps URL
     */
    generateMapsUrl(location, zoom = 15) {
        return `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=${zoom}&output=embed`;
    }

    /**
     * Generate URL with multiple markers
     * @param {Array} locations - Array of location objects
     * @param {Object} center - Center coordinates
     * @param {number} zoom - Zoom level
     * @returns {string} Google Maps URL with markers
     */
    generateMapsUrlWithMarkers(locations, center, zoom = 13) {
        let url = `https://maps.google.com/maps?q=${center.lat},${center.lng}&z=${zoom}`;

        locations.forEach((location, index) => {
            const lat = location.coordinates?.lat || location.lat;
            const lng = location.coordinates?.lng || location.lng;
            const label = location.name ? location.name.charAt(0).toUpperCase() : (index + 1);
            url += `&markers=color:blue%7Clabel:${label}%7C${lat},${lng}`;
        });

        url += '&output=embed';
        return url;
    }

    /**
     * Add event listener
     * @param {Function} listener - Event listener function
     */
    addEventListener(listener) {
        this.listeners.add(listener);
    }

    /**
     * Remove event listener
     * @param {Function} listener - Event listener function
     */
    removeEventListener(listener) {
        this.listeners.delete(listener);
    }

    /**
     * Notify all listeners
     * @param {string} event - Event type
     * @param {*} data - Event data
     */
    notifyListeners(event, data) {
        this.listeners.forEach(listener => {
            try {
                listener(event, data);
            } catch (error) {
                console.error('Error in location service listener:', error);
            }
        });
    }

    /**
     * Get current location (cached)
     * @returns {Object|null} Current location
     */
    getCurrentLocationCached() {
        return this.currentLocation;
    }

    /**
     * Check if location is fresh (less than 5 minutes old)
     * @returns {boolean}
     */
    isLocationFresh() {
        if (!this.currentLocation) return false;
        const fiveMinutes = 5 * 60 * 1000;
        return (Date.now() - this.currentLocation.timestamp) < fiveMinutes;
    }

    /**
     * Cleanup service
     */
    destroy() {
        this.clearWatch();
        this.listeners.clear();
        this.currentLocation = null;
    }
}