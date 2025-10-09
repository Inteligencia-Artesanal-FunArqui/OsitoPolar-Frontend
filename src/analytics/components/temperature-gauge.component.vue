<script>
/**
 * @component temperature-gauge
 * @description Displays current temperature in a gauge visualization
 */
export default {
  name: "temperature-gauge",
  props: {
    /**
     * @type {Number}
     * @description Current temperature value to display
     */
    value: {
      type: Number,
      required: true
    },

    /**
     * @type {Number}
     * @description Minimum value for the gauge scale
     */
    minValue: {
      type: Number,
      default: 0
    },

    /**
     * @type {Number}
     * @description Maximum value for the gauge scale
     */
    maxValue: {
      type: Number,
      default: 40
    },

    /**
     * @type {Number}
     * @description Minimum optimal temperature value
     */
    optimalMin: {
      type: Number,
      default: 18
    },

    /**
     * @type {Number}
     * @description Maximum optimal temperature value
     */
    optimalMax: {
      type: Number,
      default: 25
    }
  },
  computed: {
    /**
     * Calculates the rotation angle for the gauge needle
     * @returns {string} CSS transform rotation value
     */
    needleRotation() {
      const range = this.maxValue - this.minValue;
      const valuePercentage = (this.value - this.minValue) / range;
      const angle = -90 + (valuePercentage * 180); // -90 to 90 degrees
      return `rotate(${angle}deg)`;
    },

    /**
     * Determines the status of the current temperature
     * @returns {string} Status: 'normal', 'warning', or 'critical'
     */
    temperatureStatus() {
      if (this.value < this.optimalMin || this.value > this.optimalMax) {
        // Further from optimal range = critical
        const minDiff = Math.abs(this.value - this.optimalMin);
        const maxDiff = Math.abs(this.value - this.optimalMax);
        const threshold = (this.optimalMax - this.optimalMin) * 0.2;

        if (minDiff > threshold || maxDiff > threshold) {
          return 'critical';
        }
        return 'warning';
      }
      return 'normal';
    },

    /**
     * Determines the color for the gauge based on temperature status
     * @returns {string} CSS color value
     */
    gaugeColor() {
      switch(this.temperatureStatus) {
        case 'critical': return '#FF5252';
        case 'warning': return '#FFC107';
        default: return '#2196F3';
      }
    }
  }
}
</script>

<template>
  <div class="gauge-container">
    <div class="gauge">
      <div class="gauge-background">
        <div class="gauge-fill" :style="{ borderColor: gaugeColor }"></div>
        <div class="gauge-cover"></div>
      </div>
      <div class="gauge-needle" :style="{ transform: needleRotation }"></div>
    </div>
    <div class="temperature-value">{{ value.toFixed(1) }}°C</div>
  </div>
</template>

<style scoped>
.gauge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.gauge {
  position: relative;
  width: 200px;
  height: 100px;
  margin: 0 auto;
}

.gauge-background {
  position: relative;
  height: 100%;
  overflow: hidden;
  text-align: center;
}

.gauge-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  height: 200px;
  border: 20px solid #2196F3;
  border-radius: 50%;
  clip-path: polygon(0 100%, 100% 100%, 100% 50%, 0 50%);
}

.gauge-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  height: 200px;
  background: white;
  border-radius: 50%;
  clip-path: polygon(0 100%, 100% 100%, 100% 60%, 0 60%);
  transform: scale(0.8);
}

.gauge-needle {
  position: absolute;
  bottom: 0;
  left: 100px;
  width: 3px;
  height: 80px;
  background: #333;
  transform-origin: bottom center;
  transform: rotate(0deg);
  transition: transform 0.5s ease-in-out;
}

.temperature-value {
  font-size: 2rem;
  font-weight: bold;
  margin-top: 1rem;
  color: #333;
}
</style>