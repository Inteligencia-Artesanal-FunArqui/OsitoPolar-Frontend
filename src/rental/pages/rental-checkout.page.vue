<script>
import RentalPageHeader from '../components/rental-page-header.component.vue';
import RentalLoadingState from '../components/rental-loading-state.component.vue';
import RentalEquipmentSummary from '../components/rental-equipment-summary.component.vue';
import RentalConfigurationForm from '../components/rental-configuration-form.component.vue';
import RentalPricingSummary from '../components/rental-pricing-summary.component.vue';
import { RentalCatalogService } from '../services/rental-catalog.service.js';

export default {
  name: 'rental-checkout-page',
  components: {
    RentalPageHeader,
    RentalLoadingState,
    RentalEquipmentSummary,
    RentalConfigurationForm,
    RentalPricingSummary
  },
  data() {
    return {
      equipmentData: null,
      configurationData: null,
      pricingData: null,
      loading: false,
      error: null,
      rentalCatalogService: new RentalCatalogService()
    };
  },
  computed: {
    equipmentId() {
      return this.$route.params.equipmentId;
    }
  },
  created() {
    if (this.equipmentId) {
      this.loadEquipmentData();
    }
  },
  watch: {
    // Watch for route changes to reload data
    equipmentId: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.loadEquipmentData();
        }
      }
    }
  },
  methods: {
    async loadEquipmentData() {
      if (!this.equipmentId) return;

      this.loading = true;
      this.error = null;

      try {
        const response = await this.rentalCatalogService.getRentalEquipmentById(this.equipmentId);
        const equipment = this.rentalCatalogService.mapRentalEquipment([response.data])[0] || response.data;
        this.equipmentData = equipment;
      } catch (err) {
        console.error('Error loading equipment data:', err);
        this.error = 'Failed to load equipment data. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    handleEquipmentLoaded(equipment) {
      if (equipment && !this.equipmentData) {
        this.equipmentData = equipment;
      }
    },

    handleConfigurationChange(config) {
      this.configurationData = config;
    },

    handlePricingUpdate(pricing) {
      this.pricingData = pricing;
    },

    handleCheckoutSubmit(requestData) {
      console.log('Checkout submitted:', requestData);
    },

    handleNavigateBack() {
      // Force router navigation
      this.$router.push({ name: 'rental-catalog' });
    },

    retryLoading() {
      this.loadEquipmentData();
    }
  }
}
</script>
<template>
  <div class="checkout-page">
    <!-- Page Header Component -->
    <rental-page-header
        title="Configure Rental"
        :show-back-button="true"
        back-text="Back to catalog"
        @navigate-back="handleNavigateBack"
    />

    <!-- Show content based on current state -->
    <div v-if="equipmentId" class="checkout-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-overlay">
        <rental-loading-state message="Loading equipment information..." />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="retryLoading" class="retry-button">
          Try again
        </button>
        <button @click="handleNavigateBack" class="back-button">
          Back to catalog
        </button>
      </div>

      <!-- Normal content when data is available -->
      <template v-else-if="equipmentData">
        <!-- Equipment Summary Component -->
        <rental-equipment-summary
            :key="equipmentId"
            :equipment-id="equipmentId"
            :equipment-data="equipmentData"
            class="equipment-section"
            @equipment-loaded="handleEquipmentLoaded"
        />

        <div class="checkout-container">
          <!-- Configuration Form Component -->
          <rental-configuration-form
              :equipment="equipmentData"
              class="configuration-section"
              @configuration-change="handleConfigurationChange"
          />

          <!-- Pricing Summary Component -->
          <rental-pricing-summary
              :equipment="equipmentData"
              :configuration="configurationData"
              class="pricing-section"
              @pricing-update="handlePricingUpdate"
              @checkout-submit="handleCheckoutSubmit"
          />
        </div>
      </template>
    </div>

    <!-- Message shown when NO equipmentId -->
    <div v-else class="no-equipment">
      <p>Specified equipment not found.</p>
      <button @click="handleNavigateBack" class="back-button">
        Back to catalog
      </button>
    </div>
  </div>
</template>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.checkout-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.equipment-section {
  grid-column: 1 / -1;
}

.configuration-section {
  grid-column: span 1;
}

.pricing-section {
  grid-column: span 1;
  position: sticky;
  top: 2rem;
}

.loading-overlay, .error-message, .no-equipment {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  margin-bottom: 2rem;
  padding: 2rem;
}

.error-message {
  color: #e74c3c;
  text-align: center;
}

.retry-button, .back-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.retry-button {
  background-color: #3498db;
  color: white;
  margin-right: 1rem;
}

.back-button {
  background-color: #f1f3f4;
  color: #333;
}

.retry-button:hover {
  background-color: #2980b9;
}

.back-button:hover {
  background-color: #e1e8ed;
}

/* Responsive Grid */
@media (max-width: 1200px) {
  .checkout-container {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .pricing-section {
    grid-column: span 2;
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .equipment-section,
  .configuration-section,
  .pricing-section {
    grid-column: span 1;
  }

  .checkout-content {
    padding: 1rem;
  }
}
</style>