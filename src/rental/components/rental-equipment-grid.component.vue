<script>
import RentalEquipmentCard from './rental-equipment-card.component.vue';

export default {
  name: 'rental-equipment-grid',
  components: {
    RentalEquipmentCard
  },
  props: {
    equipment: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleRequestRental(equipment) {
      this.$emit('request-rental', equipment);
    }
  }
}
</script>

<template>
  <div class="equipment-grid-container">
    <op-loading-state v-if="loading" :label="$t('rental.catalog.loading')" />

    <op-empty-state
        v-else-if="equipment.length === 0"
        icon="pi pi-inbox"
        :title="$t('rental.catalog.noEquipment')"
        :message="$t('rental.catalog.noEquipmentHint')" />

    <div v-else class="equipment-grid">
      <rental-equipment-card
          v-for="item in equipment"
          :key="item.id"
          :equipment="item"
          @request-rental="handleRequestRental"
      />
    </div>
  </div>
</template>

<style scoped>
.equipment-grid-container {
  min-height: 400px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #666;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .equipment-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem 0;
  }
}
</style>