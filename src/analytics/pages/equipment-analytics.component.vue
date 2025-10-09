<script>
/**
 * @component equipment-analytics
 * @description Page component for displaying detailed equipment analytics
 * Similar to dashboard but focused on a specific equipment
 */
import TemperatureGaugeComponent from "../../analytics/components/temperature-gauge.component.vue";
import TemperatureChartComponent from "../../analytics/components/temperature-chart.component.vue";
import TemperatureHistoryComponent from "../../analytics/components/temperature-history.component.vue";
import LocationMapComponent from "../../analytics/components/location-map.component.vue";
import { AnalyticsService} from "../services/analytics.service.js";
import { EquipmentService} from "../../equipment/services/equipment.service.js";
import httpInstance from "../../shared/http.instance.js";

export default {
  name: 'equipment-analytics',
  components: {
    TemperatureGaugeComponent,
    TemperatureChartComponent,
    TemperatureHistoryComponent,
    LocationMapComponent
  },
  data() {
    return {
      // Equipment details
      equipment: null,

      // Analytics data
      readings: [],
      energyReadings: [],
      dailyAverages: [],
      summariesAvailable: true,

      // for the map
      allEquipment: [],

      // State
      loading: true,
      hasError: false,
      errorMessage: '',

      // Services
      analyticsService: null,
      equipmentService: null
    };
  },
  computed: {
    /**
     * Gets the equipment ID from the route params
     * @returns {string} Equipment ID
     */
    equipmentId() {
      return this.$route.params.id;
    },

    /**
     * Gets the optimal temperature range
     * @returns {Object} Min and max optimal temperatures
     */
    optimalRange() {
      return this.equipment ? {
        min: this.equipment.optimalTemperatureMin,
        max: this.equipment.optimalTemperatureMax
      } : { min: 0, max: 40 };
    }
  },
  methods: {
    /**
     * Loads all required data for the analytics view
     */
    /**
     * Loads all required data for the analytics view
     */
    /**
     * Loads all required data for the analytics view
     * IMPROVED: Each section loads independently, failures don't break the whole page
     */
    async loadAll() {
      console.log('Loading analytics data for equipment:', this.equipmentId);

      this.loading = true;
      this.hasError = false;

      // Initialize arrays to avoid undefined errors
      this.readings = [];
      this.dailyAverages = [];
      this.allEquipment = [];

      try {
        // 1) Load all equipment for the map (independent)
        try {
          const allEquipmentResponse = await httpInstance.get('/equipments');
          this.allEquipment = allEquipmentResponse.data;
          console.log('📍 All equipment loaded for map:', this.allEquipment.length, 'items');
        } catch (error) {
          console.warn('⚠️ Could not load equipment list for map:', error.message);
          this.allEquipment = [];
        }

        // 2) Load specific equipment details (critical)
        try {
          this.equipment = await this.equipmentService.getEquipmentById(this.equipmentId);
          console.log('🔧 Equipment details loaded:', this.equipment.name);
        } catch (error) {
          console.error(' Could not load equipment details:', error.message);
          this.hasError = true;
          this.errorMessage = `Equipment ${this.equipmentId} not found`;
          this.loading = false;
          return; // Exit early if equipment doesn't exist
        }

        // 3) Load temperature readings (independent)
        try {
          const readingsResponse = await this.analyticsService.getEquipmentReadings(
              this.equipmentId,
              'temperature',
              24,
              100
          );

          if (readingsResponse.data?.data) {
            this.readings = readingsResponse.data.data.map(reading => ({
              id: reading.id,
              equipmentId: reading.equipmentId,
              temperature: reading.value || reading.temperature,
              timestamp: reading.timestamp,
              status: reading.status || 'normal'
            }));
            console.log('Temperature readings loaded:', this.readings.length, 'items');
          } else {
            this.readings = [];
            console.log('ℹ No temperature readings available');
          }
        } catch (error) {
          console.warn(' Could not load temperature readings:', error.message);
          this.readings = [];
        }

        // 4) Load energy readings (independent) - NUEVO
        try {
          const energyResponse = await this.analyticsService.getEquipmentReadings(
              this.equipmentId,
              'energy',
              24,
              100
          );

          if (energyResponse.data?.data) {
            this.energyReadings = energyResponse.data.data.map(reading => ({
              id: reading.id,
              equipmentId: reading.equipmentId,
              consumption: reading.value || reading.consumption,
              timestamp: reading.timestamp,
              status: reading.status || 'normal'
            }));
            console.log('⚡ Energy readings loaded:', this.energyReadings.length, 'items');
          } else {
            this.energyReadings = [];
            console.log('ℹNo energy readings available');
          }
        } catch (error) {
          console.warn('Could not load energy readings:', error.message);
          this.energyReadings = [];
        }

        try {
          const summariesResponse = await this.analyticsService.getEquipmentSummaries(
              this.equipmentId,
              'daily-averages',
              7
          );

          if (summariesResponse.data?.data) {
            this.dailyAverages = summariesResponse.data.data.map(summary => ({
              id: summary.id,
              equipmentId: summary.equipmentId,
              date: summary.date,
              averageTemperature: summary.averageTemperature,
              minTemperature: summary.minTemperature,
              maxTemperature: summary.maxTemperature
            }));
            console.log('Daily averages loaded:', this.dailyAverages.length, 'items');
            this.summariesAvailable = true;
          } else {
            this.dailyAverages = [];
            this.summariesAvailable = false;
            console.log('ℹ No daily summaries available');
          }
        } catch (error) {
          console.warn(' Daily summaries not available:', error.message);
          this.dailyAverages = [];
          this.summariesAvailable = false;

        }

        this.loading = false;

        // Show success message based on what we got
        const loadedFeatures = [];
        if (this.readings.length > 0) loadedFeatures.push('temperature');
        if (this.energyReadings?.length > 0) loadedFeatures.push('energy');
        if (this.dailyAverages.length > 0) loadedFeatures.push('summaries');

        console.log(`🎉 Analytics loaded successfully! Available: [${loadedFeatures.join(', ')}]`);

      } catch (error) {
        console.error(' Unexpected error loading analytics:', error);
        this.loading = false;
        this.hasError = true;
        this.errorMessage = `Unexpected error: ${error.message}`;
      }
    }
  },
  created() {
    this.analyticsService = new AnalyticsService();
    this.equipmentService = new EquipmentService();
    this.loadAll();
  }
};
</script>

<template>
  <div class="analytics-page">
    <div class="page-header">
      <h1 class="page-title">{{ equipment ? equipment.name : 'Equipment' }} Analytics</h1>
      <router-link
          :to="{ name: 'equipment-detail', params: { id: equipmentId }}"
          class="back-button"
      >
        <i class="pi pi-arrow-left"></i>
        Back to Equipment Control
      </router-link>
    </div>

    <div class="loading-container" v-if="loading">
      <pv-progress-spinner />
      <p>Loading analytics data...</p>
    </div>

    <div class="error-container" v-else-if="hasError">
      <p class="error-message">{{ errorMessage }}</p>
      <pv-button label="Try Again" @click="loadAll" class="p-button-primary" />
    </div>

    <div v-else class="analytics-content">
      <!-- Summary cards section -->
      <div class="summary-section">
        <div class="summary-card">
          <div class="summary-label">Current Temperature</div>
          <div class="summary-value" :class="{ 'negative-temp': equipment.currentTemperature < 0 }">
            {{ equipment.currentTemperature.toFixed(1) }}°C
          </div>
          <div class="summary-status" :class="'status-' + equipment.getTemperatureStatus()">
            {{ equipment.getTemperatureStatus().toUpperCase() }}
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-label">Set Temperature</div>
          <div class="summary-value" :class="{ 'negative-temp': equipment.setTemperature < 0 }">
            {{ equipment.setTemperature.toFixed(1) }}°C
          </div>
          <div class="summary-info">
            Optimal: {{ optimalRange.min.toFixed(1) }}°C - {{ optimalRange.max.toFixed(1) }}°C
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-label">Power Status</div>
          <div class="summary-value power-status" :class="{ 'on': equipment.isPoweredOn }">
            {{ equipment.isPoweredOn ? 'ON' : 'OFF' }}
          </div>
          <div class="summary-info">
            {{ equipment.energyConsumption.current }} {{ equipment.energyConsumption.unit }}
          </div>
        </div>
      </div>

      <!-- Charts grid - first row -->
      <div class="analytics-grid">
        <!-- Temperature Gauge -->
        <div class="analytics-card">
          <h2 class="card-title">Temperature Gauge</h2>
          <temperature-gauge-component
              :value="equipment.currentTemperature"
              :optimal-min="optimalRange.min"
              :optimal-max="optimalRange.max"
          />
        </div>

        <!-- Temperature Chart -->
        <div class="analytics-card">
          <h2 class="card-title">Temperature Over Time (24h)</h2>
          <temperature-chart-component :readings="readings" />
        </div>
      </div>

      <!-- Charts grid - second row -->
      <div class="analytics-grid">
        <!-- Temperature History -->
        <div class="analytics-card">
          <h2 class="card-title">Daily Temperature Averages (7d)</h2>
          <temperature-history-component :daily-averages="dailyAverages" />
        </div>

        <div class="analytics-card">
          <h2 class="card-title">Equipment Location</h2>
          <location-map-component
              :equipment="allEquipment"
              :selected-id="parseInt(equipmentId)"
          />
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.analytics-page {
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
  color: #0079c2;
  font-size: 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #555;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #f0f0f0;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.error-message {
  color: #e74c3c;
  font-size: 1.1rem;
}

.summary-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.summary-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 250px;
  max-width: 300px;
}

.summary-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.summary-value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.negative-temp {
  color: #1565C0;
}

.summary-status {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-normal {
  background-color: #4CAF50;
  color: white;
}

.status-warning {
  background-color: #FFC107;
  color: #333;
}

.status-critical {
  background-color: #F44336;
  color: white;
}

.power-status {
  color: #F44336;
}

.power-status.on {
  color: #4CAF50;
}

.summary-info {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.5rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.analytics-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  padding: 1.5rem;
  min-height: 320px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.analytics-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .analytics-grid {
    grid-template-columns: 1fr;
    max-width: 800px;
  }

  .summary-section {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    max-width: 800px;
  }
}

@media (max-width: 768px) {
  .analytics-page {
    padding: 0.75rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .summary-section {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .summary-card {
    min-width: unset;
    max-width: unset;
    padding: 1.25rem;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .analytics-card {
    min-height: 280px;
    padding: 1.25rem;
  }
}

@media (max-width: 480px) {
  .summary-value {
    font-size: 1.75rem;
  }

  .card-title {
    font-size: 1rem;
  }
}
</style>