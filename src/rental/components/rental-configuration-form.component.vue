<script>
import { RentalPricingService } from '../services/rental-pricing.service.js';

export default {
  name: 'rental-configuration-form',
  props: {
    equipment: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      rentalMonths: 1,
      quantity: 1,
      deliveryAddress: '',
      preferredDate: null,
      notes: '',
      discounts: [], // tiers of this item (GET /rentalPricing), drive the badges

      showQuantityDropdown: false,
      showMonthsDropdown: false
    };
  },
  computed: {
    monthOptions() {
      if (!this.equipment) return [];
      const maxMonths = Math.max(24, this.equipment.minimumRentalPeriod || 1);
      const min = this.equipment.minimumRentalPeriod || 1; // shorter periods are rejected by the request validation
      return Array.from({ length: maxMonths }, (_, i) => i + 1).filter(months => months >= min).map(months => ({
        value: months,
        label: `${months} ${this.$t('rental.configuration.month', months)}`
      }));
    },

    quantityOptions() {
      if (!this.equipment) return [];
      const maxQty = Math.min(this.equipment.stock || 10, 10);
      return Array.from({ length: maxQty }, (_, i) => {
        const quantity = i + 1;
        return {
          value: quantity,
          label: `${quantity} ${this.$t('rental.configuration.unit', quantity)}`
        };
      });
    },
    minDate() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    },
    minDateIso() {
      return this.toIsoDay(this.minDate);
    },
    preferredDateIso() {
      return this.preferredDate ? this.toIsoDay(this.preferredDate) : '';
    }
  },
  watch: {
    rentalMonths() {
      this.emitConfiguration();
    },
    quantity() {
      this.emitConfiguration();
    },
    deliveryAddress() {
      this.emitConfiguration();
    },
    preferredDate() {
      this.emitConfiguration();
    },
    notes() {
      this.emitConfiguration();
    }
  },
  methods: {
    discountFor(months) {
      return new RentalPricingService().getApplicableDiscount(months, this.discounts);
    },

    async loadDiscounts() {
      try {
        const response = await new RentalPricingService().getRentalPricing(this.equipment.id);
        this.discounts = response.data[0]?.discounts || [];
      } catch (error) {
        console.error('Error loading discount tiers:', error);
      }
    },

    selectMonth(months) {
      this.rentalMonths = months;
      this.showMonthsDropdown = false;
    },

    selectQuantity(qty) {
      this.quantity = qty;
      this.showQuantityDropdown = false;
    },

    toIsoDay(date) {
      const pad = n => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    },

    onDateInput(event) {
      const value = event.target.value; // yyyy-mm-dd, local midnight to avoid a UTC day shift
      this.preferredDate = value ? new Date(`${value}T00:00:00`) : null;
    },

    emitConfiguration() {
      this.$emit('configuration-change', {
        rentalMonths: this.rentalMonths,
        quantity: this.quantity,
        deliveryAddress: this.deliveryAddress,
        preferredDate: this.preferredDate,
        notes: this.notes
      });
    },

    closeDropdowns() {
      this.showQuantityDropdown = false;
      this.showMonthsDropdown = false;
    },

    onOutsideClick(e) {
      if (!this.$el.contains(e.target)) {
        this.closeDropdowns();
      }
    }
  },
  mounted() {
    // start at the minimum rental period and publish the initial configuration so pricing is computed right away
    this.rentalMonths = this.equipment?.minimumRentalPeriod || 1;
    this.emitConfiguration();
    if (this.equipment) this.loadDiscounts();
    document.addEventListener('click', this.onOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.onOutsideClick);
  }
}
</script>

<template>
  <div class="config-card" @click="closeDropdowns">
    <div class="card-header">
      <h2>{{ $t('rental.configuration.title') }}</h2>
    </div>

    <div class="form-grid">
      <!-- Rental Period -->
      <div class="form-group">
        <label class="form-label">{{ $t('rental.configuration.period') }}</label>
        <div class="custom-select" @click.stop="showMonthsDropdown = !showMonthsDropdown">
          <div class="select-value">
            <span>{{ rentalMonths }} {{ $t('rental.configuration.month', rentalMonths) }}</span>
            <i class="pi pi-chevron-down"></i>
          </div>
          <div v-if="showMonthsDropdown" class="select-dropdown">
            <div
                v-for="option in monthOptions.slice(0, 12)"
                :key="option.value"
                @click="selectMonth(option.value)"
                :class="['dropdown-item', { active: rentalMonths === option.value }]"
            >
              {{ option.label }}
              <span v-if="discountFor(option.value)" class="discount-badge">-{{ discountFor(option.value) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quantity -->
      <div class="form-group">
        <label class="form-label">{{ $t('rental.configuration.quantity') }}</label>
        <div class="custom-select" @click.stop="showQuantityDropdown = !showQuantityDropdown">
          <div class="select-value">
            <span>{{ quantity }} {{ $t('rental.configuration.unit', quantity) }}</span>
            <i class="pi pi-chevron-down"></i>
          </div>
          <div v-if="showQuantityDropdown" class="select-dropdown">
            <div
                v-for="option in quantityOptions"
                :key="option.value"
                @click="selectQuantity(option.value)"
                :class="['dropdown-item', { active: quantity === option.value }]"
            >
              {{ option.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- Preferred Date: native input = any month, keyboard + mobile friendly -->
      <div class="form-group full-width">
        <label class="form-label" for="rental-start-date">{{ $t('rental.configuration.startDate') }}</label>
        <input
            id="rental-start-date"
            type="date"
            class="custom-textarea date-input"
            :min="minDateIso"
            :value="preferredDateIso"
            @input="onDateInput"
        />
      </div>

      <!-- Delivery Address -->
      <div class="form-group full-width">
        <label class="form-label" for="rental-address">{{ $t('rental.configuration.deliveryAddress') }}</label>
        <textarea
            id="rental-address"
            v-model="deliveryAddress"
            class="custom-textarea"
            rows="3"
            :placeholder="$t('rental.configuration.addressPlaceholder')"
            required
        ></textarea>
      </div>

      <!-- Additional Notes -->
      <div class="form-group full-width">
        <label class="form-label">{{ $t('rental.configuration.notes') }}</label>
        <textarea
            v-model="notes"
            class="custom-textarea"
            rows="2"
            :placeholder="$t('rental.configuration.notesPlaceholder')"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<style scoped>
.config-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid var(--op-border);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, var(--op-brand) 0%, #005a94 100%);
  color: white;
  padding: 1.5rem 2rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-grid {
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-label {
  font-size: 0.95rem;
  color: #333;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.custom-select {
  position: relative;
  cursor: pointer;
}

.select-value {
  background: var(--op-surface-muted);
  border: 2px solid var(--op-border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.select-value:hover {
  border-color: var(--op-brand);
  background: #f0f8ff;
}

.select-value i.pi-calendar {
  margin-right: 0.5rem;
  color: var(--op-brand);
}

.select-dropdown,

.dropdown-item {
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f3f4;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f0f8ff;
  color: var(--op-brand);
}

.dropdown-item.active {
  background: var(--op-brand);
  color: white;
}

.discount-badge {
  background: #27ae60;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}









.custom-textarea {
  background: var(--op-surface-muted);
  border: 2px solid var(--op-border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
  outline: none;
}

.custom-textarea:focus {
  border-color: var(--op-brand);
  background: #f0f8ff;
  box-shadow: 0 0 0 3px rgba(0, 121, 194, 0.1);
}

.custom-textarea::placeholder {
  color: #999;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    padding: 1.5rem;
    gap: 1rem;
  }

  .form-group.full-width {
    grid-column: span 1;
  }
}

.date-input { width: 100%; }
</style>
