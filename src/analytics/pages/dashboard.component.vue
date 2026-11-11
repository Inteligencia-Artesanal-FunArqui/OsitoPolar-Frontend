<script>
/**
 * Import component dependencies
 */
import TemperatureGauge from "../components/temperature-gauge.component.vue";
import TemperatureChart from "../components/temperature-chart.component.vue";
import LocationMap from "../components/location-map.component.vue";
import TemperatureHistory from "../components/temperature-history.component.vue";

/**
 * Import service and models
 */
import { AnalyticsService } from "../services/analytics.service.js";
import { EquipmentService } from "../../equipment/services/equipment.service.js";
import { TemperatureReading } from "../models/temperature-reading.entity.js";
import { DailyTemperatureAverage } from "../models/daily-temperature-average.entity.js";
import httpInstance from "../../shared/http.instance.js";
import { Equipment } from "../../equipment/models/equipment.entity.js";

/**
 * @component dashboard
 * @description Main dashboard for monitoring refrigeration equipment
 * Displays temperature gauge, charts, and location map
 */
export default {
  name: "dashboard",
  components: {
    TemperatureGauge,
    TemperatureChart,
    LocationMap,
    TemperatureHistory
  },
  data() {
    return {
      /**
       * @type {Object|null}
       * @description Currently selected equipment
       */
      equipment: null,

      /**
       * @type {Array<TemperatureReading>}
       * @description Temperature readings for selected equipment
       */
      temperatureReadings: [],

      /**
       * @type {Array<DailyTemperatureAverage>}
       * @description Daily temperature averages for selected equipment
       */
      dailyAverages: [],

      /**
       * @type {Array}
       * @description All equipment items for the map
       */
      allEquipment: [],

      /**
       * @type {Number}
       * @description ID of currently selected equipment
       */
      selectedEquipmentId: null,

      hasError: false,

      /**
       * @type {AnalyticsService|null}
       * @description Service for handling analytics operations
       */
      analyticsService: null,

      /**
       * @type {EquipmentService|null}
       * @description Service for equipment operations
       */
      equipmentService: null,

      /**
       * @type {Boolean}
       * @description Loading state for data fetching
       */
      loading: true
    };
  },
  computed: {
    /**
     * Gets the current temperature value
     * @returns {Number} Current temperature or 0 if equipment not loaded
     */
    currentTemperature() {
      return this.equipment ? this.equipment.currentTemperature : 0;
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
     * Loads initial data for the dashboard
     */
    loadData() {
      this.loading = true;
      this.hasError = false;

      httpInstance.get('/equipments').then(response => {
        this.allEquipment = response.data.map(item => new Equipment(item));
        // no hard-coded id: start with the first unit the user actually owns
        if (!this.allEquipment.some(e => String(e.id) === String(this.selectedEquipmentId))) {
          this.selectedEquipmentId = this.allEquipment[0]?.id ?? null;
        }
        if (this.selectedEquipmentId === null) {
          this.loading = false;
          return;
        }
        return this.loadEquipmentData(this.selectedEquipmentId);
      }).catch(error => {
        console.error('Error loading equipment:', error);
        this.loading = false;
        this.hasError = true;
      });
    },

    /**
     * Loads data for a specific equipment item
     * @param {Number} equipmentId - ID of the equipment to load
     */
    async loadEquipmentData(equipmentId) {
      try {
        this.loading = true;

        this.equipment = await this.equipmentService.getEquipmentById(equipmentId);

        const readingsResponse = await this.analyticsService.getEquipmentReadings(
            equipmentId,
            'temperature',
            24,
            50
        );

        if (readingsResponse.data?.data) {
          this.temperatureReadings = readingsResponse.data.data.map(reading => ({
            id: reading.id,
            equipmentId: reading.equipmentId,
            temperature: reading.value || reading.temperature,
            timestamp: reading.timestamp,
            status: reading.status || 'normal'
          }));
        } else {
          this.temperatureReadings = [];
        }

        const summariesResponse = await this.analyticsService.getEquipmentSummaries(
            equipmentId,
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
        } else {
          this.dailyAverages = [];
        }

        this.loading = false;

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
        this.hasError = true;
      }
    },

    /**
     * Handles selection of equipment from the map
     * @param {Number} equipmentId - ID of the selected equipment
     */
    onSelectEquipment(equipmentId) {
      if (this.selectedEquipmentId !== equipmentId) {
        this.selectedEquipmentId = equipmentId;
        this.loadEquipmentData(equipmentId);
      }
    }
  },
  created() {
    this.analyticsService = new AnalyticsService();
    this.equipmentService = new EquipmentService();
    this.loadData();
  }
}
</script>

<template>
  <div class="dashboard-container">
    <op-page-header :title="$t('dashboard.title')" :subtitle="equipment ? equipment.name : $t('dashboard.subtitle')">
      <pv-button
          v-if="equipment"
          :label="$t('dashboard.fullAnalytics')"
          icon="pi pi-chart-line"
          severity="secondary"
          outlined
          @click="$router.push({ name: 'equipment-analytics', params: { id: equipment.id } })" />
    </op-page-header>

    <op-loading-state v-if="loading" :label="$t('dashboard.loading')" />
    <op-error-state v-else-if="hasError" :message="$t('dashboard.errorLoading')" @retry="loadData" />
    <op-empty-state
        v-else-if="allEquipment.length === 0"
        icon="pi pi-chart-line"
        :title="$t('dashboard.emptyTitle')"
        :message="$t('dashboard.emptyMessage')">
      <pv-button :label="$t('equipment.addButton')" icon="pi pi-plus" @click="$router.push('/equipment/new')" />
    </op-empty-state>

    <div class="dashboard-grid" v-else>
      <section class="op-card">
        <h2 class="card-title">{{ $t('dashboard.currentTemperature') }}</h2>
        <temperature-gauge
            :value="currentTemperature"
            :optimal-min="optimalRange.min"
            :optimal-max="optimalRange.max"
        />
      </section>

      <section class="op-card">
        <h2 class="card-title">{{ $t('dashboard.temperatureOverTime') }}</h2>
        <temperature-chart :readings="temperatureReadings" />
      </section>

      <section class="op-card">
        <h2 class="card-title">{{ $t('dashboard.temperatureByLocation') }}</h2>
        <location-map
            :equipment="allEquipment"
            :selected-id="selectedEquipmentId"
            @select-equipment="onSelectEquipment"
        />
      </section>

      <section class="op-card">
        <h2 class="card-title">{{ $t('dashboard.temperatureHistory') }}</h2>
        <temperature-history :daily-averages="dailyAverages" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 440px), 1fr));
  gap: var(--op-space-5);
}

.card-title {
  font-size: 1rem;
  color: var(--op-text-muted);
  margin-bottom: var(--op-space-4);
  font-weight: 600;
}
</style>
