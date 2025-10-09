<script>
import RentalHeroSection from '../components/rental-hero-section.component.vue';
import RentalFilterBar from '../components/rental-filter-bar.component.vue';
import RentalEquipmentGrid from '../components/rental-equipment-grid.component.vue';
import RentalPaymentModal from '../components/rental-payment-modal.component.vue';
import { RentalCatalogService } from '../services/rental-catalog.service.js';
import { RentalPricingService } from '../services/rental-pricing.service.js';
import { RentalRequestService } from '../services/rental-request.service.js';
import { RentalPaymentService } from '../services/rental-payment.service.js';

export default {
  name: 'rental-catalog-page',
  components: {
    RentalHeroSection,
    RentalFilterBar,
    RentalEquipmentGrid,
    RentalPaymentModal
  },
  data() {
    return {
      equipment: [],
      loading: true,
      showPaymentModal: false,
      selectedEquipment: null,
      rentalDetails: null,

      // Services
      catalogService: null,
      pricingService: null,
      requestService: null,
      paymentService: null
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
          summary: 'Error',
          detail: 'No se pudieron cargar los equipos disponibles',
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
    },

    async handleProcessPayment(paymentData) {
      try {
        // 1. Create rental request
        const requestData = {
          userId: this.$store.state.user.id,
          rentalEquipmentId: paymentData.rentalDetails.equipmentId,
          quantity: 1,
          rentalPeriodMonths: paymentData.rentalDetails.months,
          deliveryAddress: this.$store.state.user.defaultAddress,
          preferredStartDate: new Date().toISOString(),
          status: 'submitted'
        };

        const response = await this.requestService.createRentalRequest(requestData);

        if (response.data.id) {
          // 2. Initialize payment session with backend
          const paymentSession = await this.paymentService.initializePaymentSession({
            rentalRequestId: response.data.id,
            userId: this.$store.state.user.id,
            amount: paymentData.rentalDetails.firstPayment,
            currency: 'USD',
            paymentMethod: paymentData.paymentMethod
          });

          // 3. Redirect to Stripe checkout or payment confirmation page
          if (paymentSession.data.checkoutUrl) {
            window.location.href = paymentSession.data.checkoutUrl;
          } else {
            // Fallback to internal payment page if needed
            this.$router.push({
              name: 'payment-processing',
              params: { sessionId: paymentSession.data.sessionId }
            });
          }
        }
      } catch (error) {
        console.error('Error creating rental request:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo procesar la solicitud de alquiler',
          life: 3000
        });
      }
    }
  },
  created() {
    this.catalogService = new RentalCatalogService();
    this.pricingService = new RentalPricingService();
    this.requestService = new RentalRequestService();
    this.paymentService = new RentalPaymentService();
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

      <rental-payment-modal
          v-model:visible="showPaymentModal"
          :rental-details="rentalDetails"
          @process-payment="handleProcessPayment"
      />
    </div>
  </div>
</template>

<style scoped>
.rental-catalog-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 2rem 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (max-width: 768px) {
  .rental-catalog-page {
    padding: 1rem 0;
  }
}
</style>