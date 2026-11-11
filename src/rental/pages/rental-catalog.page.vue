<script>
import RentalHeroSection from '../components/rental-hero-section.component.vue';
import RentalFilterBar from '../components/rental-filter-bar.component.vue';
import RentalEquipmentGrid from '../components/rental-equipment-grid.component.vue';
import { RentalCatalogService } from '../services/rental-catalog.service.js';

export default {
  name: 'rental-catalog-page',
  components: {
    RentalHeroSection,
    RentalFilterBar,
    RentalEquipmentGrid
  },
  data() {
    return {
      equipment: [],
      loading: true,
      selectedEquipment: null,

      // Services
      catalogService: null
    };
  },
  methods: {
    async loadEquipment() {
      try {
        this.loading = true;
        const response = await this.catalogService.getAllRentalEquipment();
        this.equipment = this.catalogService.mapRentalEquipment(response.data);
      } catch (error) {
        console.error('Error loading rental equipment:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('common.error'),
          detail: this.$t('rental.catalog.loadError'),
          life: 3000
        });
      } finally {
        this.loading = false;
      }
    },

    async handleFilterChange(filters) {
      try {
        this.loading = true;
        let response;

        if (filters.type === 'all') {
          response = await this.catalogService.getAllRentalEquipment();
        } else {
          response = await this.catalogService.getRentalEquipmentByType(filters.type);
        }

        let equipment = this.catalogService.mapRentalEquipment(response.data);

        // Apply price filter
        equipment = equipment.filter(item =>
            item.monthlyPrice >= filters.minPrice &&
            item.monthlyPrice <= filters.maxPrice
        );

        // Apply sorting
        if (filters.sortBy === 'price_asc') {
          equipment.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
        } else if (filters.sortBy === 'price_desc') {
          equipment.sort((a, b) => b.monthlyPrice - a.monthlyPrice);
        } else if (filters.sortBy === 'name_asc') {
          equipment.sort((a, b) => a.name.localeCompare(b.name));
        }

        this.equipment = equipment;
      } catch (error) {
        console.error('Error filtering equipment:', error);
        this.$toast.add({ severity: 'error', summary: this.$t('common.error'), detail: this.$t('rental.catalog.loadError'), life: 3000 });
      } finally {
        this.loading = false;
      }
    },

    async handleRequestRental(equipment) {
      this.selectedEquipment = equipment;

      // Navigate to rental configuration page
      this.$router.push({
        name: 'rental-checkout',
        params: { equipmentId: equipment.id }
      });
    }
  },
  created() {
    this.catalogService = new RentalCatalogService();
    this.loadEquipment();
  }
}
</script>

<template>
  <div class="rental-catalog-page">
    <div class="page-container">
      <rental-hero-section />

      <rental-filter-bar @filter-change="handleFilterChange" />

      <rental-equipment-grid
          :equipment="equipment"
          :loading="loading"
          @request-rental="handleRequestRental"
      />

    </div>
  </div>
</template>

<style scoped>
.rental-catalog-page {
  padding: 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

@media (max-width: 768px) {
  .rental-catalog-page {
    padding: 1rem 0;
  }
}
</style>