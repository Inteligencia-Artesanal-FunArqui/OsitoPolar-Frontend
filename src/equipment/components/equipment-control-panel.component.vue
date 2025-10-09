<script>
/**
 * @component equipment-control-panel
 * @description Main control panel for managing equipment settings,
 *              now with a mini analytics preview (gauge + line chart).
 */
import EquipmentTemperatureControl from './equipment-temperature-control.component.vue';
import EquipmentPowerToggle from './equipment-power-toggle.component.vue';
import TemperatureGaugeComponent from "../../analytics/components/temperature-gauge.component.vue";
import TemperatureChartComponent from "../../analytics/components/temperature-chart.component.vue";
import { AnalyticsService } from '../../analytics/services/analytics.service.js';

export default {
  name: "equipment-control-panel",
  components: {
    EquipmentTemperatureControl,
    EquipmentPowerToggle,
    TemperatureGaugeComponent,
    TemperatureChartComponent
  },
  props: {
    /**
     * @type {Object}
     * @description Equipment object to control (instance of Equipment class)
     */
    equipment: {
      type: Object,
      required: true
    }
  },
  emits: ['update-temperature', 'toggle-power'],
  data() {
    return {
      // micro‐analytics data
      readings: [],
      loadingAnalytics: true,
      analyticsService: null
    };
  },
  computed: {
    /**
     * Adjust display properties based on equipment temperature range
     */
    displayProperties() {
      if (this.equipment.currentTemperature < 0) {
        return {
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#1565C0'
        };
      }

      return {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#333'
      };
    },

    /**
     * Get the status color dynamically from equipment entity
     */
    statusColor() {
      return this.equipment.getStatusColor ?
          this.equipment.getStatusColor() :
          this.getDefaultStatusColor();
    },

    /**
     * Get the temperature status text from equipment entity
     */
    temperatureStatus() {
      return this.equipment.getTemperatureStatus ?
          this.equipment.getTemperatureStatus() :
          this.getDefaultTemperatureStatus();
    }
  },
  methods: {
    /**
     * Emit up to parent to update set-temperature
     */
    onUpdateTemperature(newTemp) {
      this.$emit('update-temperature', newTemp);
    },

    /**
     * Emit up to parent to toggle power
     */
    onTogglePower(newState) {
      this.$emit('toggle-power', newState);
    },

    /**
     * Fetch the last 9 readings for the mini-chart
     */
    async loadPreviewData() {
      try {
        this.loadingAnalytics = true;

        const response = await this.analyticsService.getEquipmentReadings(
            this.equipment.id,
            'temperature',
            24,
            9
        );

        if (response.data?.data && response.data.data.length > 0) {
          this.readings = response.data.data.map(reading => ({
            temperature: reading.value || reading.temperature,
            timestamp: reading.timestamp,
            status: reading.status || 'normal',
            getFormattedTime() {
              return new Date(this.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });
            }
          }));

          console.log('Temperature readings loaded:', this.readings.length, 'items');
        } else {
          this.readings = [];
          console.log('ℹ No temperature readings available for equipment', this.equipment.id);
        }

      } catch (error) {
        console.error('Error loading temperature data:', error);
        this.readings = [];
      } finally {
        this.loadingAnalytics = false;
      }
    },

    /**
     * Format temperature for display
     */
    formatTemperature(temp) {
      return temp.toFixed(1);
    },

    /**
     * Default status color method when equipment entity method is unavailable
     */
    getDefaultStatusColor() {
      const tempStatus = this.getDefaultTemperatureStatus();
      switch(tempStatus) {
        case 'critical': return '#FF5252';
        case 'warning': return '#FFC107';
        default: return '#4CAF50';
      }
    },

    /**
     * Default temperature status method when equipment entity method is unavailable
     */
    getDefaultTemperatureStatus() {
      if (!this.equipment) return 'normal';

      const { currentTemperature, optimalTemperatureMin, optimalTemperatureMax } = this.equipment;

      if (currentTemperature < optimalTemperatureMin ||
          currentTemperature > optimalTemperatureMax) {

        const minDiff = Math.abs(currentTemperature - optimalTemperatureMin);
        const maxDiff = Math.abs(currentTemperature - optimalTemperatureMax);
        const threshold = Math.abs(optimalTemperatureMax - optimalTemperatureMin) * 0.2;

        if (minDiff > threshold || maxDiff > threshold) {
          return 'critical';
        }
        return 'warning';
      }
      return 'normal';
    }
  },
  created() {
    this.analyticsService = new AnalyticsService();
    this.loadPreviewData();
  },
  watch: {
    'equipment.id': function(newId, oldId) {
      if (newId !== oldId) {
        this.loadPreviewData();
      }
    }
  }
};
</script>

<template>
  <div class="control-panel">
    <h2 class="control-panel-title">Equipment Control</h2>

    <div class="control-section">
      <h3 class="section-title">Power Control</h3>
      <equipment-power-toggle
          :is-powered-on="equipment.isPoweredOn"
          @toggle="onTogglePower"
      />
    </div>

    <div class="control-section" :class="{ disabled: !equipment.isPoweredOn }">
      <h3 class="section-title">Temperature Setting</h3>
      <equipment-temperature-control
          :current-temperature="equipment.currentTemperature"
          :set-temperature="equipment.setTemperature"
          :optimal-min="equipment.optimalTemperatureMin"
          :optimal-max="equipment.optimalTemperatureMax"
          :disabled="!equipment.isPoweredOn"
          @update-temperature="onUpdateTemperature"
      />
    </div>

    <div class="status-section">
      <div
          class="status-indicator"
          :style="{ backgroundColor: statusColor }"
      ></div>
      <div class="status-text">
        <strong>Status:</strong> {{ temperatureStatus }}
      </div>
    </div>

    <!-- Analytics Preview -->
    <div class="analytics-preview-section">
      <h3 class="section-title">Temperature Analytics</h3>

      <div v-if="loadingAnalytics" class="analytics-loading">
        <pv-progress-spinner style="width:40px; height:40px" />
        <span>Loading analytics...</span>
      </div>

      <div v-else class="analytics-preview-container">
        <!-- Visualization grid -->
        <div class="analytics-cards">

          <div class="analytics-card current-temperature-card">
            <h4 class="card-title">Current Temperature</h4>
            <div class="temperature-display">
              <div class="temperature-gauge">
                <div class="gauge-line"></div>
              </div>
              <div class="temperature-value" :style="displayProperties">
                {{ formatTemperature(equipment.currentTemperature) }}°C
              </div>
            </div>
          </div>

          <!-- Temperature Chart -->
          <div class="analytics-card temperature-chart-card">
            <h4 class="card-title">Temperature Over Time</h4>
            <div class="chart-container">
              <temperature-chart-component :readings="readings" />
            </div>
          </div>
        </div>

        <!--Button to view full analytics-->
        <router-link
            :to="{ name: 'equipment-analytics', params: { id: equipment.id } }"
            class="view-analytics-button"
        >
          <i class="pi pi-chart-line"></i>
          View Full Analytics
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.control-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

.control-panel-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.section-title {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 1rem;
}

.control-section {
  margin-bottom: 1.5rem;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-text {
  color: #555;
}

.analytics-preview-section {
  border-top: 1px solid #eee;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
}

.analytics-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  padding: 2rem 0;
}

.analytics-preview-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.analytics-cards {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
}

.analytics-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.card-title {
  font-size: 1rem;
  color: #666;
  margin-top: 0;
  margin-bottom: 1rem;
  font-weight: normal;
}

/* Styles for current temperature card */
.current-temperature-card {
  display: flex;
  flex-direction: column;
}

.temperature-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.temperature-gauge {
  position: relative;
  height: 50px;
  width: 100px;
  margin-bottom: 10px;
}

.gauge-line {
  position: absolute;
  width: 2px;
  height: 50px;
  background-color: #333;
  left: 50%;
  top: 0;
  transform: rotate(-30deg);
  transform-origin: bottom center;
}

.temperature-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
}

/* Styles for the temperature chart */
.temperature-chart-card {
  display: flex;
  flex-direction: column;
}

.chart-container {
  flex: 1;
  position: relative;
}

.temperature-chart {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Button to view full analytics */
.view-analytics-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #2196F3;
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  justify-content: center;
  transition: background 0.2s;
}

.view-analytics-button:hover {
  background: #1976D2;
}

@media (max-width: 768px) {
  .analytics-cards {
    grid-template-columns: 1fr;
  }
}
</style>