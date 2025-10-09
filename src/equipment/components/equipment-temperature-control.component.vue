<script>
/**
 * @component equipment-temperature-control
 * @description Control for adjusting equipment temperature
 */
export default {
  name: "equipment-temperature-control",
  props: {
    /**
     * @type {Number}
     * @description Current temperature of the equipment
     */
    currentTemperature: {
      type: Number,
      required: true
    },

    /**
     * @type {Number}
     * @description Set/target temperature of the equipment
     */
    setTemperature: {
      type: Number,
      required: true
    },

    /**
     * @type {Number}
     * @description Minimum optimal temperature
     */
    optimalMin: {
      type: Number,
      required: true
    },

    /**
     * @type {Number}
     * @description Maximum optimal temperature
     */
    optimalMax: {
      type: Number,
      required: true
    },

    /**
     * @type {Boolean}
     * @description Whether control is disabled
     */
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      /**
       * @type {Number}
       * @description Temperature value for the slider
       */
      temperatureValue: this.setTemperature
    };
  },
  watch: {
    setTemperature(newValue) {
      this.temperatureValue = newValue;
    }
  },
  computed: {
    /**
     * Determines color based on temperature value
     * @returns {string} CSS color value
     */
    temperatureColor() {
      if (this.temperatureValue < this.optimalMin) {
        return '#3F51B5'; // Cold - blue
      } else if (this.temperatureValue > this.optimalMax) {
        return '#F44336'; // Hot - red
      }
      return '#4CAF50'; // Optimal - green
    },

    /**
     * Gets the slider min/max values
     * @returns {Object} Min and max values
     */
    sliderRange() {
      // Set range to extend beyond optimal range
      const rangeExtension = 5;
      return {
        min: Math.floor(this.optimalMin - rangeExtension),
        max: Math.ceil(this.optimalMax + rangeExtension)
      };
    }
  },
  methods: {
    /**
     * Applies temperature change
     * @emits update-temperature
     */
    applyTemperatureChange() {
      this.$emit('update-temperature', this.temperatureValue);
    },

    /**
     * Increases temperature by 0.5 degree
     */
    increaseTemperature() {
      if (this.temperatureValue < this.sliderRange.max) {
        this.temperatureValue += 0.5;
        this.applyTemperatureChange();
      }
    },

    /**
     * Decreases temperature by 0.5 degree
     */
    decreaseTemperature() {
      if (this.temperatureValue > this.sliderRange.min) {
        this.temperatureValue -= 0.5;
        this.applyTemperatureChange();
      }
    }
  }
}
</script>

<template>
  <div class="temperature-control" :class="{ 'disabled': disabled }">
    <div class="temperature-display">
      <div class="current-temperature">
        <span class="label">Current:</span>
        <span class="value">{{ currentTemperature.toFixed(1) }}°C</span>
      </div>
      <div class="set-temperature">
        <span class="label">Set:</span>
        <span class="value" :style="{ color: temperatureColor }">{{ temperatureValue.toFixed(1) }}°C</span>
      </div>
    </div>

    <div class="control-buttons">
      <pv-button
          icon="pi pi-minus"
          class="p-button-rounded p-button-secondary"
          @click="decreaseTemperature"
          :disabled="disabled || temperatureValue <= sliderRange.min"
      />

      <pv-slider
          v-model="temperatureValue"
          :min="sliderRange.min"
          :max="sliderRange.max"
          :step="0.5"
          class="temperature-slider"
          :disabled="disabled"
          @slide-end="applyTemperatureChange"
      />

      <pv-button
          icon="pi pi-plus"
          class="p-button-rounded p-button-secondary"
          @click="increaseTemperature"
          :disabled="disabled || temperatureValue >= sliderRange.max"
      />
    </div>

    <div class="optimal-range">
      <span>Optimal range: {{ optimalMin.toFixed(1) }}°C - {{ optimalMax.toFixed(1) }}°C</span>
    </div>
  </div>
</template>

<style scoped>
.temperature-control {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.temperature-display {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
}

.current-temperature, .set-temperature {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 0.9rem;
  color: #666;
}

.value {
  font-weight: bold;
  font-size: 2rem;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.temperature-slider {
  flex: 1;
  height: 0.5rem;
}

.optimal-range {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  margin-top: 0.5rem;
}

.disabled {
  opacity: 0.7;
  pointer-events: none;
}
</style>