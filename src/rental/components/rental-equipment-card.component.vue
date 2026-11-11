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
      return `${this.equipment.currency} ${this.equipment.monthlyPrice} / ${this.$t('rental.perMonth')}`;
    },
    equipmentImage() {
      return this.equipment.imageUrl || '';
    }
  },
  emits: ['request-rental'],
  methods: {
    handleRequestRental() {
      // the catalog page owns navigation to the checkout
      this.$emit('request-rental', this.equipment);
    }
  }
}
</script>

<template>
  <div class="rental-card">
    <div class="rental-card-image">
      <img v-if="equipmentImage" :src="equipmentImage" :alt="equipment.name" />
      <i v-else class="pi pi-box rental-card-placeholder" aria-hidden="true"></i>
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
          class="request-button"
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
  object-fit: cover; /* the demo SVGs are 4:3 illustrations: fill the frame */
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

.rental-card-placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-size: 3rem;
  color: var(--op-brand);
  opacity: 0.4;
}
</style>