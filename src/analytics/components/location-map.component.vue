<script>
import { LocationService } from '../services/location.service.js';

/**
 * @component location-map
 * @description Clean map component using iframe with external location service
 */
export default {
  name: "location-map",
  props: {
    equipment: {
      type: Array,
      required: true,
      default: () => []
    },
    selectedId: {
      type: [Number, String],
      default: null
    },
    height: {
      type: String,
      default: '350px'
    },
    showControls: {
      type: Boolean,
      default: true
    }
  },
  emits: ['select-equipment', 'location-detected', 'location-clicked', 'location-error'],
  data() {
    return {
      locationService: null,
      currentLocation: null,
      locationError: null,
      isLoadingLocation: false,
      mapCenter: { lat: -12.046374, lng: -77.042793 }, // Lima, Peru
      zoom: 13,
      retryCount: 0,
      maxRetries: 3
    }
  },
  computed: {
    /**
     * Generate clean Google Maps iframe URL
     */
    mapUrl() {
      if (this.equipment.length === 0) {
        // Simple map if no equipment
        return this.locationService?.generateMapsUrl(this.mapCenter, this.zoom) ||
            `https://maps.google.com/maps?q=${this.mapCenter.lat},${this.mapCenter.lng}&z=${this.zoom}&output=embed`;
      }

      // Map with equipment markers
      return this.locationService?.generateMapsUrlWithMarkers(
          this.equipment,
          this.mapCenter,
          this.zoom
      ) || `https://maps.google.com/maps?q=${this.mapCenter.lat},${this.mapCenter.lng}&z=${this.zoom}&output=embed`;
    },

    /**
     * Selected equipment data
     */
    selectedEquipment() {
      return this.equipment.find(eq => eq.id == this.selectedId);
    },

    /**
     * Equipment count for display
     */
    equipmentCount() {
      return this.equipment.length;
    },

    /**
     * Location status message
     */
    locationStatusMessage() {
      if (this.locationError) return this.locationError.userMessage || 'Location error';
      if (this.currentLocation) return 'Location detected';
      return 'Getting location...';
    },

    /**
     * Check if we should show retry button
     */
    shouldShowRetry() {
      return this.locationError && this.retryCount < this.maxRetries;
    }
  },
  methods: {
    /**
     * Initialize location service
     */
    initLocationService() {
      this.locationService = new LocationService();

      // Add event listener for location service events
      this.locationService.addEventListener(this.handleLocationEvent);
    },

    /**
     * Handle location service events
     * @param {string} event - Event type
     * @param {*} data - Event data
     */
    handleLocationEvent(event, data) {
      switch (event) {
        case 'location-detected':
          this.currentLocation = data;
          this.isLoadingLocation = false;
          this.locationError = null;
          this.retryCount = 0;
          this.$emit('location-detected', data);
          this.showToast('success', 'Location detected successfully');
          this.findNearestEquipment();
          break;

        case 'location-updated':
          this.currentLocation = data;
          this.$emit('location-detected', data);
          break;

        case 'location-error':
          this.locationError = data;
          this.isLoadingLocation = false;
          this.$emit('location-error', data);
          this.showToast('error', data.userMessage);
          break;
      }
    },

    /**
     * Get current location
     */
    async getCurrentLocation() {
      if (!this.locationService) {
        this.initLocationService();
      }

      this.isLoadingLocation = true;
      this.locationError = null;

      try {
        await this.locationService.getCurrentPosition();
        // Success is handled by event listener
      } catch (error) {
        // Error is handled by event listener
        this.retryCount++;
      }
    },

    /**
     * Retry getting location
     */
    retryLocation() {
      if (this.retryCount < this.maxRetries) {
        this.getCurrentLocation();
      }
    },

    /**
     * Find nearest equipment to user location
     */
    findNearestEquipment() {
      if (!this.currentLocation || this.equipment.length === 0) return;

      const nearest = this.locationService.findNearest(this.currentLocation, this.equipment);

      if (nearest) {
        const distanceKm = (nearest.distance / 1000).toFixed(2);
        this.showToast('info', `Nearest: ${nearest.name} (${distanceKm} km away)`);
      }
    },

    /**
     * Center map on current location
     */
    centerOnCurrentLocation() {
      if (this.currentLocation) {
        this.mapCenter = {
          lat: this.currentLocation.lat,
          lng: this.currentLocation.lng
        };
        this.zoom = 16;
        this.showToast('info', 'Centered on your location');
      }
    },

    /**
     * Center map on selected equipment
     */
    centerOnEquipment() {
      if (this.selectedEquipment?.location?.coordinates) {
        this.mapCenter = {
          lat: this.selectedEquipment.location.coordinates.lat,
          lng: this.selectedEquipment.location.coordinates.lng
        };
        this.zoom = 16;
        this.showToast('info', `Centered on ${this.selectedEquipment.name}`);
      }
    },

    /**
     * Open in Google Maps app
     */
    openInGoogleMaps() {
      const center = `${this.mapCenter.lat},${this.mapCenter.lng}`;
      const url = `https://www.google.com/maps?q=${center}&z=${this.zoom}`;
      window.open(url, '_blank');
    },

    /**
     * Handle equipment selection from list
     */
    selectEquipment(equipment) {
      this.$emit('select-equipment', equipment.id);
      this.centerOnEquipment();
    },

    /**
     * Show toast notification
     */
    showToast(severity, message) {
      if (this.$toast) {
        this.$toast.add({
          severity,
          summary: severity === 'success' ? 'Location' :
              severity === 'error' ? 'Error' : 'Info',
          detail: message,
          life: 3000
        });
      }
    },

    /**
     * Get temperature status class
     */
    getTemperatureStatus(equipment) {
      const temp = equipment.currentTemperature;
      const min = equipment.optimalTemperatureMin;
      const max = equipment.optimalTemperatureMax;

      if (temp < min - 2 || temp > max + 2) return 'critical';
      if (temp < min || temp > max) return 'warning';
      return 'normal';
    }
  },
  watch: {
    selectedId() {
      // Auto-center when equipment is selected externally
      if (this.selectedEquipment) {
        this.centerOnEquipment();
      }
    }
  },
  mounted() {
    this.initLocationService();
    this.getCurrentLocation();
  },
  beforeUnmount() {
    if (this.locationService) {
      this.locationService.removeEventListener(this.handleLocationEvent);
      this.locationService.destroy();
    }
  }
}
</script>

<template>
  <div class="map-wrapper" :style="{ height }">
    <!-- Header -->
    <div class="map-header">
      <div class="map-title">
        <h3>Equipment Locations</h3>
        <span class="equipment-count" v-if="equipmentCount > 0">
          {{ equipmentCount }} device{{ equipmentCount !== 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Controls (NO superpuestos) -->
      <div class="map-actions" v-if="showControls">
        <button
            class="action-btn location-btn"
            :class="{ 'loading': isLoadingLocation }"
            @click="getCurrentLocation"
            :disabled="isLoadingLocation"
            title="Get current location"
        >
          <i class="pi pi-map-marker" v-if="!isLoadingLocation"></i>
          <i class="pi pi-spin pi-spinner" v-else></i>
        </button>

        <button
            v-if="currentLocation"
            class="action-btn center-btn"
            @click="centerOnCurrentLocation"
            title="Center on my location"
        >
          <i class="pi pi-crosshairs"></i>
        </button>

        <button
            v-if="selectedEquipment"
            class="action-btn equipment-btn"
            @click="centerOnEquipment"
            title="Center on selected equipment"
        >
          <i class="pi pi-building"></i>
        </button>

        <button
            class="action-btn external-btn"
            @click="openInGoogleMaps"
            title="Open in Google Maps"
        >
          <i class="pi pi-external-link"></i>
        </button>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      <div class="location-status"
           :class="{
             'success': currentLocation,
             'error': locationError,
             'loading': isLoadingLocation
           }">
        <i class="pi" :class="{
          'pi-check': currentLocation,
          'pi-exclamation-triangle': locationError,
          'pi-spin pi-spinner': isLoadingLocation
        }"></i>
        <span>{{ locationStatusMessage }}</span>

        <button
            v-if="shouldShowRetry"
            class="retry-btn"
            @click="retryLocation"
            title="Retry location detection"
        >
          <i class="pi pi-refresh"></i>
        </button>
      </div>

      <div class="selected-info" v-if="selectedEquipment">
        <i class="pi pi-building"></i>
        <span>{{ selectedEquipment.name }}</span>
        <span class="temp" :class="`temp-${getTemperatureStatus(selectedEquipment)}`">
          {{ selectedEquipment.currentTemperature.toFixed(1) }}°C
        </span>
      </div>
    </div>

    <!-- Map Container -->
    <div class="map-container">
      <iframe
          :src="mapUrl"
          class="map-iframe"
          frameborder="0"
          style="border:0;"
          allowfullscreen=""
          loading="lazy"
          :title="`Map showing ${equipmentCount} equipment locations`"
      ></iframe>
    </div>

    <!-- Equipment List (Bottom) -->
    <div class="equipment-list" v-if="equipment.length > 0">
      <div
          v-for="equip in equipment"
          :key="equip.id"
          class="equipment-item"
          :class="{
          'active': equip.id == selectedId,
          [`status-${getTemperatureStatus(equip)}`]: true
        }"
          @click="selectEquipment(equip)"
          :title="`${equip.name} - ${equip.currentTemperature.toFixed(1)}°C`"
      >
        <div class="item-info">
          <div class="item-name">{{ equip.name }}</div>
          <div class="item-location">{{ equip.location?.name || 'Unknown' }}</div>
        </div>
        <div class="item-temp">{{ equip.currentTemperature.toFixed(1) }}°C</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(33, 150, 243, 0.15);
  background: white;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

.map-title h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
}

.equipment-count {
  font-size: 0.85rem;
  color: #6c757d;
  background: rgba(33, 150, 243, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  margin-left: 8px;
}

.map-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(33, 150, 243, 0.9);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: rgba(33, 150, 243, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-btn.loading {
  animation: pulse 1.5s infinite;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  min-height: 48px;
}

.location-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.location-status.success {
  color: #28a745;
}

.location-status.error {
  color: #dc3545;
}

.location-status.loading {
  color: #6c757d;
}

.retry-btn {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.retry-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #495057;
}

.temp {
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.temp-normal { color: #28a745; background: rgba(40, 167, 69, 0.1); }
.temp-warning { color: #ffc107; background: rgba(255, 193, 7, 0.1); }
.temp-critical { color: #dc3545; background: rgba(220, 53, 69, 0.1); }

.map-container {
  flex: 1;
  position: relative;
  min-height: 250px;
}

.map-iframe {
  width: 100%;
  height: 100%;
  border: none;
  filter: hue-rotate(220deg) saturate(1.2) brightness(0.9);
}

.equipment-list {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: white;
  overflow-x: auto;
  border-top: 1px solid #dee2e6;
}

.equipment-item {
  min-width: 140px;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.equipment-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.equipment-item.active {
  background: rgba(33, 150, 243, 0.1);
  border-color: #2196F3;
}

.equipment-item.status-warning {
  border-left: 4px solid #ffc107;
}

.equipment-item.status-critical {
  border-left: 4px solid #dc3545;
}

.equipment-item.status-normal {
  border-left: 4px solid #28a745;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.item-location {
  font-size: 0.75rem;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.item-temp {
  font-size: 0.9rem;
  font-weight: bold;
  color: #2196F3;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Responsive design */
@media (max-width: 768px) {
  .map-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .map-actions {
    justify-content: center;
  }

  .status-bar {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .equipment-list {
    padding: 12px 16px;
  }

  .equipment-item {
    min-width: 120px;
    padding: 10px;
  }
}
</style>