<script>
export default {
  name: 'rental-equipment-card',
  props: {
    equipment: {
      type: Object,
      required: true
    }
  },
  computed: {
    formattedPrice() {
      return `${this.equipment.monthlyPrice} ${this.equipment.currency} / ${this.$t('rental.configuration.month')}`;
    },
    equipmentImage() {
      return this.equipment.imageUrl ;
    }
  },
  methods: {
    handleRequestRental() {
      this.$emit('request-rental', this.equipment);
      this.$router.push({
        name: 'rental-checkout',
        params: { equipmentId: this.equipment.id }
      });
    }
  }
}
</script>

<template>
  <div class="rental-card">
    <div class="rental-card-image">
      <img
          :src="equipmentImage"
          :alt="equipment.name"
          @error="$event.target.src=''"
      />
      <div class="availability-badge" v-if="equipment.stock > 0">
        {{ $t('rental.catalog.available') }}
      </div>
    </div>

    <div class="rental-card-content">
      <h3 class="equipment-name">{{ equipment.name }}</h3>
      <p class="equipment-model">{{ equipment.model }}</p>

      <div class="price-section">
        <span class="price-label">{{ $t('rental.catalog.from') }}</span>
        <span class="price-value">{{ formattedPrice }}</span>
      </div>

      <pv-button
          :label="$t('rental.catalog.request')"
          @click="handleRequestRental"
          class="p-button-success request-button"
          :disabled="equipment.stock === 0"
      />
    </div>
  </div>
</template>

<style scoped>
.rental-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.rental-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.rental-card-image {
  position: relative;
  height: 200px;
  background: #f5f5f5;
}

.rental-card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.availability-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #4CAF50;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.rental-card-content {
  padding: 1.5rem;
}

.equipment-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.equipment-model {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.price-section {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.price-label {
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 0.25rem;
}

.price-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #e74c3c;
}

.request-button {
  width: 100%;
}
</style>