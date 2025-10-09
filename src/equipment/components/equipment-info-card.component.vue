<script>
/**
 * @component equipment-info-card
 * @description Display card with equipment information
 */
export default {
  name: "equipment-info-card",
  props: {
    /**
     * @type {Object}
     * @description Equipment object to display
     */
    equipment: {
      type: Object,
      required: true
    }
  }
}
</script>

<template>
  <div class="info-card">
    <h2 class="card-title">Equipment Information</h2>

    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Name</div>
        <div class="info-value">{{ equipment.name }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">Type</div>

        <div class="info-value">{{ equipment.getTypeDisplay ? equipment.getTypeDisplay() : equipment.type }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">Model</div>
        <div class="info-value">{{ equipment.model }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">Manufacturer</div>
        <div class="info-value">{{ equipment.manufacturer }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">Serial Number</div>
        <div class="info-value">{{ equipment.serialNumber }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">Code</div>
        <div class="info-value">{{ equipment.code }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">Installation Date</div>
        <div class="info-value">{{ equipment.getFormattedInstallationDate ? equipment.getFormattedInstallationDate() : equipment.installationDate }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">Energy Consumption</div>

        <div class="info-value">{{ equipment.energyConsumptionCurrent }} {{ equipment.energyConsumptionUnit }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">Location</div>

        <div class="info-value">{{ equipment.locationName }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">Address</div>
        <div class="info-value">{{ equipment.locationAddress }}</div>
      </div>
    </div>

    <div class="info-notes" v-if="equipment.notes">
      <h3 class="notes-title">Notes</h3>
      <p class="notes-content">{{ equipment.notes }}</p>
    </div>
  </div>
</template>

<style scoped>
.info-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.card-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.9rem;
  color: #666;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.info-notes {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.notes-title {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 0.5rem;
}

.notes-content {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>