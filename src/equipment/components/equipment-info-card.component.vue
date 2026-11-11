<script>
/**
 * @component equipment-info-card
 * @description Display card with equipment information
 */
import { equipmentTypeKey } from "../../shared/badge-tokens.js";
import { formatDate } from "../../shared/format.js";

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
  },
  computed: {
    typeLabel() {
      const key = equipmentTypeKey(this.equipment.type);
      return this.$te(key) ? this.$t(key) : (this.equipment.type || '-');
    },
    installationDate() {
      return formatDate(this.equipment.installationDate, this.$i18n.locale) || '-';
    }
  }
}
</script>

<template>
  <div class="info-card">
    <h2 class="card-title">{{ $t('equipment.info.title') }}</h2>

    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">{{ $t('equipment.info.name') }}</div>
        <div class="info-value">{{ equipment.name }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">{{ $t('equipment.info.type') }}</div>

        <div class="info-value">{{ typeLabel }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">{{ $t('equipment.info.model') }}</div>
        <div class="info-value">{{ equipment.model }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">{{ $t('equipment.info.manufacturer') }}</div>
        <div class="info-value">{{ equipment.manufacturer }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">{{ $t('equipment.info.serialNumber') }}</div>
        <div class="info-value">{{ equipment.serialNumber }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">{{ $t('equipment.info.code') }}</div>
        <div class="info-value">{{ equipment.code }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">{{ $t('equipment.info.installationDate') }}</div>
        <div class="info-value">{{ installationDate }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">{{ $t('equipment.info.energy') }}</div>

        <div class="info-value">{{ equipment.energyConsumptionCurrent }} {{ equipment.energyConsumptionUnit }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">{{ $t('equipment.info.location') }}</div>

        <div class="info-value">{{ equipment.locationName }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">{{ $t('equipment.info.address') }}</div>
        <div class="info-value">{{ equipment.locationAddress }}</div>
      </div>
    </div>

    <div class="info-notes" v-if="equipment.notes">
      <h3 class="notes-title">{{ $t('equipment.info.notes') }}</h3>
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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