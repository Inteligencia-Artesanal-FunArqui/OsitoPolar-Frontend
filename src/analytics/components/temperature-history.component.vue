<script>
import {TemperatureFormattingService} from "../services/temperature-formatting.service.js";

/**
 * @component temperature-history
 * @description Displays average temperature history by day in a bar chart
 */
export default {
  name: "temperature-history",
  props: {
    /**
     * @type {Array}
     * @description Array of daily temperature average objects
     */
    dailyAverages: {
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
      // Sort by date (from oldest to newest)
      const sortedAverages = [...this.dailyAverages].sort((a, b) =>
          new Date(a.date) - new Date(b.date)
      );

      return {
        labels: sortedAverages.map(avg =>
            TemperatureFormattingService.getDayName(avg.date)
        ),
        datasets: [{
          label: 'Average Temperature',
          data: sortedAverages.map(avg => avg.averageTemperature),
          backgroundColor: '#2196F3',
          borderRadius: 5
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
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + '°';
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
                return `${context.formattedValue}°C`;
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
    <pv-chart type="bar" :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-container {
  height: 200px;
  width: 100%;
}
</style>