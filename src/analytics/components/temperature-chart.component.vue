<script>
import {TemperatureFormattingService} from "../services/temperature-formatting.service.js";

/**
 * @component temperature-chart
 * @description Displays temperature readings over time in a line chart
 */
export default {
  name: "temperature-chart",
  props: {
    /**
     * @type {Array}
     * @description Array of temperature reading objects
     */
    readings: {
      type: Array,
      required: true
    }
  },
  computed: {
    /**
     * Formats the data for chart display
     * @returns {Object} Chart data configuration
     */
    chartData() {
      const sortedReadings = [...this.readings].sort((a, b) =>
          new Date(a.timestamp) - new Date(b.timestamp)
      );

      return {
        labels: sortedReadings.map(reading =>
            TemperatureFormattingService.formatTime(reading.timestamp)
        ),
        datasets: [{
          label: 'Temperature',
          data: sortedReadings.map(reading => reading.temperature),
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#2196F3'
        }]
      };
    },

    /**
     * Chart configuration options
     * @returns {Object} Chart options configuration
     */
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return value.toFixed(1) + '°';
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.y.toFixed(1)}°C`;
              }
            }
          }
        }
      };
    }
  }
}
</script>

<template>
  <div class="chart-container">
    <pv-chart type="line" :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-container {
  height: 200px;
  width: 100%;
}
</style>