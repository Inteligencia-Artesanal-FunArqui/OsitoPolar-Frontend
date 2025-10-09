<script>
import ToggleSwitch from 'primevue/toggleswitch';

export default {
  name: "equipment-power-toggle",
  components: {
    ToggleSwitch
  },
  props: {
    /**
     * @type {Boolean}
     * @description Current power state
     */
    isPoweredOn: {
      type: Boolean,
      required: true
    }
  },
  emits: ['toggle'],
  methods: {
    /**
     * Toggles the power state
     * @emits toggle
     */
    togglePower() {
      this.$emit('toggle', !this.isPoweredOn);
    }
  }
}
</script>

<template>
  <div class="power-toggle">
    <div class="toggle-container">
          <toggle-switch
              :modelValue="isPoweredOn"
              @update:modelValue="togglePower"
              class="power-switch"
            />
      <span
          class="power-label"
          :style="{ color: isPoweredOn ? '#4CAF50' : '#666' }"
      >
        {{ isPoweredOn ? 'ON' : 'OFF' }}
      </span>
    </div>

    <div class="power-button">
      <button
          class="round-button"
          :class="{ 'active': isPoweredOn }"
          @click="togglePower"
      >
        <i class="pi pi-power-off"></i>
      </button>
      <span class="button-label">Power</span>
    </div>
  </div>
</template>

<style scoped>
.power-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
}

.toggle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.power-label {
  font-weight: bold;
  font-size: 1.2rem;
}

.power-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.round-button {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.round-button i {
  font-size: 1.5rem;
  color: #666;
  transition: color 0.3s ease;
}

.round-button.active {
  background-color: #4CAF50;
}

.round-button.active i {
  color: white;
}

.button-label {
  font-size: 0.9rem;
  color: #666;
}
</style>
