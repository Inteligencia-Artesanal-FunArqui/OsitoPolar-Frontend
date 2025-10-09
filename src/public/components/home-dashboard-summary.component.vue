<script>
import { EquipmentService } from '../../equipment/services/equipment.service.js';
import { RentalCatalogService } from '../../rental/services/rental-catalog.service.js';

export default {
  name: 'home-dashboard-summary',
  data() {
    return {
      userEquipment: [],
      rentalEquipment: [],
      loadingUserEquipment: true,
      loadingRentalEquipment: true,
      equipmentService: null,
      rentalService: null
    };
  },
  computed: {
    featuredUserEquipment() {
      return this.userEquipment.slice(0, 2);
    },
    featuredRentalEquipment() {
      return this.rentalEquipment.slice(0, 2);
    }
  },
  methods: {
    async loadUserEquipment() {
      try {
        this.loadingUserEquipment = true;
        this.userEquipment = await this.equipmentService.getAllEquipments();
      } catch (error) {
        console.error('Error loading user equipment:', error);
      } finally {
        this.loadingUserEquipment = false;
      }
    },

    async loadRentalEquipment() {
      try {
        this.loadingRentalEquipment = true;
        this.userEquipment = await this.equipmentService.getAllEquipments();
        this.rentalEquipment = this.rentalService.mapRentalEquipment(response.data);
      } catch (error) {
        console.error('Error loading rental equipment:', error);
      } finally {
        this.loadingRentalEquipment = false;
      }
    },

    goToMyEquipment() {
      this.$router.push('/equipment');
    },

    goToRentalCatalog() {
      this.$router.push('/rental');
    },

    getEquipmentImage(equipment) {
      return equipment.imageUrl || '/placeholder-equipment.png';
    },

    getEquipmentTypeLabel(type) {
      // Use i18n for equipment types
      return this.$t(`equipment.types.${type}`) || type;
    }
  },
  created() {
    this.equipmentService = new EquipmentService();
    this.rentalService = new RentalCatalogService();
    this.loadUserEquipment();
    this.loadRentalEquipment();
  }
};
</script>

<template>
  <div class="home-dashboard-summary">
    <!-- My Equipment Section -->
    <div class="equipment-section">
      <div class="section-header" @click="goToMyEquipment">
        <h2 class="section-title">{{ $t('home.dashboard.myEquipment') }}</h2>
        <i class="pi pi-arrow-right"></i>
      </div>

      <div class="equipment-grid">
        <div v-if="loadingUserEquipment" class="loading-placeholder">
          <div class="skeleton-card" v-for="n in 2" :key="n"></div>
        </div>

        <div v-else-if="featuredUserEquipment.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <p>{{ $t('home.dashboard.noEquipment') }}</p>
          <button @click="$router.push('/equipment/new')" class="add-equipment-btn">
            {{ $t('home.dashboard.addEquipment') }}
          </button>
        </div>

        <div v-else class="equipment-cards">
          <div
              v-for="equipment in featuredUserEquipment"
              :key="equipment.id"
              class="equipment-card"
              @click="$router.push(`/equipment/${equipment.id}`)"
          >
            <div class="card-image">
              <img
                  :src="getEquipmentImage(equipment)"
                  :alt="equipment.name"
                  @error="$event.target.src=''"
              />
              <div class="status-indicator" :class="equipment.getTemperatureStatus()"></div>
            </div>
            <div class="card-content">
              <h3 class="equipment-name">{{ equipment.name }}</h3>
              <p class="equipment-type">{{ getEquipmentTypeLabel(equipment.type) }}</p>
              <div class="temperature-info">
                <span class="current-temp">{{ equipment.currentTemperature.toFixed(1) }}°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rental Equipment Section -->
    <div class="equipment-section">
      <div class="section-header" @click="goToRentalCatalog">
        <h2 class="section-title">{{ $t('home.dashboard.rentEquipment') }}</h2>
        <i class="pi pi-arrow-right"></i>
      </div>

      <div class="equipment-grid">
        <div v-if="loadingRentalEquipment" class="loading-placeholder">
          <div class="skeleton-card" v-for="n in 2" :key="n"></div>
        </div>

        <div v-else-if="featuredRentalEquipment.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <p>{{ $t('home.dashboard.noRentalEquipment') }}</p>
        </div>

        <div v-else class="equipment-cards">
          <div
              v-for="equipment in featuredRentalEquipment"
              :key="equipment.id"
              class="equipment-card rental-card"
              @click="$router.push(`/rental/checkout/${equipment.id}`)"
          >
            <div class="card-image">
              <img
                  :src="getEquipmentImage(equipment)"
                  :alt="equipment.name"
                  @error="$event.target.src=''"
              />
              <div class="availability-badge" v-if="equipment.isAvailable">
                {{ $t('home.dashboard.available') }}
              </div>
            </div>
            <div class="card-content">
              <h3 class="equipment-name">{{ equipment.name }}</h3>
              <p class="equipment-model">{{ equipment.model }}</p>
              <div class="price-info">
                <span class="price">{{ equipment.monthlyPrice }} {{ equipment.currency }}</span>
                <span class="period">/ {{ $t('rental.configuration.month').split('|')[0].trim() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-dashboard-summary {
  display: flex;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.equipment-section {
  flex: 1;
  min-width: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.section-header:hover {
  border-bottom-color: #0079c2;
}

.section-header:hover .section-title {
  color: #0079c2;
}

.section-header:hover i {
  transform: translateX(5px);
  color: #0079c2;
}

.section-title {
  color: #0079c2;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  transition: color 0.2s ease;
}

.section-header i {
  font-size: 1.5rem;
  color: #666;
  transition: all 0.2s ease;
}

.equipment-grid {
  margin-top: 1rem;
}

.equipment-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.equipment-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.equipment-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: #0079c2;
}

.card-image {
  position: relative;
  height: 200px;
  background: #f8f9fa;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
}

.status-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.status-indicator.normal {
  background-color: #4CAF50;
}

.status-indicator.warning {
  background-color: #FFC107;
}

.status-indicator.critical {
  background-color: #F44336;
}

.availability-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #4CAF50;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.card-content {
  padding: 1.5rem;
}

.equipment-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.equipment-type,
.equipment-model {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 1rem 0;
}

.temperature-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-temp {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0079c2;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.price {
  font-size: 1.8rem;
  font-weight: 700;
  color: #e74c3c;
}

.period {
  font-size: 1rem;
  color: #666;
}

.loading-placeholder {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  background: #f0f0f0;
  border-radius: 16px;
  height: 320px;
  animation: skeleton-loading 1.5s ease-in-out infinite alternate;
}

@keyframes skeleton-loading {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #666;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ccc;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.add-equipment-btn {
  background: #0079c2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-equipment-btn:hover {
  background: #005a94;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .home-dashboard-summary {
    flex-direction: column;
    gap: 2rem;
    padding: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .equipment-cards {
    grid-template-columns: 1fr;
  }

  .equipment-card:hover {
    transform: translateY(-4px);
  }
}

@media (max-width: 480px) {
  .card-content {
    padding: 1rem;
  }

  .equipment-name {
    font-size: 1.1rem;
  }

  .current-temp,
  .price {
    font-size: 1.5rem;
  }
}
</style>