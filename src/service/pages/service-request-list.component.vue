<script>
import { ServiceRequestService } from "../services/service-request.service.js";
import { EquipmentService } from "../../equipment/services/equipment.service.js";
import ServiceRequestDetailComponent from "../components/service-request/service-request-detail.component.vue";
import RatingDialog from "../components/rating/rating-dialog.component.vue";

export default {
  name: "service-request-list",
  components: {
    ServiceRequestDetailModal: ServiceRequestDetailComponent,
    RatingDialog
  },
  data() {
    return {
      serviceRequests: [],
      equipmentList: [],
      serviceRequestService: null,
      equipmentService: null,
      loading: true,
      hasError: false,
      errorMessage: "",
      showDetailModal: false,
      showRatingDialog: false,
      selectedEquipmentDisplay: '',
      selectedLocationDisplay: '',
      selectedRequest: null,
      ratingValue: 0
    };
  },
  methods: {
    async loadRequests() {
      this.loading = true;
      this.hasError = false;

      try {
        const [requestsResponse, equipmentResponse] = await Promise.all([
          this.serviceRequestService.getAll(),
          this.equipmentService.getAllEquipments()
        ]);

        this.serviceRequests = this.serviceRequestService.mapServiceRequests(requestsResponse.data || []);
        this.equipmentList = equipmentResponse.data || [];
        this.loading = false;
      } catch (error) {
        console.error("Error loading data:", error);
        this.hasError = true;
        this.errorMessage = this.$t('service.error');
        this.loading = false;
      }
    },

    getEquipmentDisplay(equipmentId) {
      if (!this.equipmentList || this.equipmentList.length === 0) {
        return `Equipment ID: ${equipmentId}`;
      }
      const match = this.equipmentList.find(eq => String(eq.id) === String(equipmentId));
      return match ? `${match.name} (${match.code || 'No code'})` : `Equipment ID: ${equipmentId}`;
    },

    getLocationDisplay(equipmentId) {
      if (!this.equipmentList || this.equipmentList.length === 0) {
        return this.$t('service.notSpecified');
      }
      const equipment = this.equipmentList.find(e => String(e.id) === String(equipmentId));
      return equipment?.location?.name || this.$t('service.notSpecified');
    },

    formatDate(date) {
      if (!date) return this.$t('service.notScheduled');
      return new Date(date).toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    viewRequestDetail(request) {
      this.selectedRequest = request;
      const equipment = this.equipmentList.find(e => String(e.id) === String(request.equipmentId));
      this.selectedEquipmentDisplay = equipment ? `${equipment.name} (${equipment.code || 'No code'})` : `Equipment ID: ${request.equipmentId}`;
      this.selectedLocationDisplay = equipment?.location?.name || "Not specified";
      this.showDetailModal = true;
    },

    openNewRequestForm() {
      this.$router.push({ name: 'new-service-request' });
    },

    openRatingForm(request) {
      this.selectedRequest = request;
      this.ratingValue = request.rating || 0;
      this.showRatingDialog = true;
    },

    async cancelRequest(request) {
      try {
        await this.serviceRequestService.cancelRequest(request.id);
        this.$toast.add({
          severity: 'success',
          summary: this.$t('common.success'),
          detail: this.$t('service.cancelSuccess'),
          life: 3000
        });
        this.loadRequests();
      } catch (error) {
        console.error('Error cancelling request:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('common.error'),
          detail: this.$t('service.cancelError'),
          life: 3000
        });
      }
    },

    async submitRating(rating) {
      try {
        // Usar el endpoint específico para agregar calificación
        await this.serviceRequestService.addFeedback(this.selectedRequest.id, rating);

        this.$toast.add({
          severity: 'success',
          summary: this.$t('client.rating.success'),
          detail: this.$t('client.rating.successMessage'),
          life: 3000
        });
        this.showRatingDialog = false;
        this.loadRequests();
      } catch (error) {
        console.error('Error submitting rating:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('client.rating.error'),
          detail: this.$t('client.rating.errorMessage'),
          life: 3000
        });
      }
    }
  },
  created() {
    this.serviceRequestService = new ServiceRequestService();
    this.equipmentService = new EquipmentService();
    this.loadRequests();
  }
};
</script>

<template>
  <div class="service-request-list">
    <div class="page-header">
      <h1>{{ $t('service.title') }}</h1>
      <pv-button
          :label="$t('service.newRequest')"
          icon="pi pi-plus"
          class="p-button-primary new-request-button"
          @click="openNewRequestForm"
      />
    </div>

    <div class="loading-state" v-if="loading">
      <pv-progress-spinner />
      <p>{{ $t('service.loading') }}</p>
    </div>

    <div class="error-state" v-else-if="hasError">
      <p>{{ errorMessage }}</p>
      <pv-button :label="$t('service.retry')" @click="loadRequests" />
    </div>

    <div class="request-grid" v-else>
      <pv-card
          v-for="req in serviceRequests"
          :key="req.id"
          class="request-card"
      >
        <template #title>
          <div class="card-title-content">
            <i class="pi pi-box"></i>
            <strong>{{ $t('service.equipment') }}:</strong>
            <span>{{ getEquipmentDisplay(req.equipmentId) }}</span>
          </div>
        </template>
        <template #subtitle>
          <div class="card-subtitle-content">
            <span class="pi pi-info-circle"></span>
            <span>{{ $t('service.status') }}:</span>
            <span :class="['status-badge', req.getStatusBadgeClass()]">
              {{ $t(`service.status.${req.status}`) }}
            </span>
          </div>
        </template>
        <template #content>
          <div class="card-details">
            <p class="detail-item"><i class="pi pi-map-marker"></i> <strong>{{ $t('service.location') }}:</strong> {{ getLocationDisplay(req.equipmentId) }}</p>
            <p class="detail-item"><i class="pi pi-clock"></i> <strong>{{ $t('service.requestedOn') }}:</strong> {{ formatDate(req.requestTime) }}</p>
            <p class="detail-item"><i class="pi pi-calendar"></i> <strong>{{ $t('service.scheduledFor') }}:</strong> {{ formatDate(req.scheduledDate) }}</p>
            <p class="detail-item"><i class="pi pi-cog"></i> <strong>{{ $t('service.serviceType') }}:</strong> {{ req.serviceType }}</p>
            <p class="detail-item" v-if="req.status === 'completed' && req.customerFeedbackRating">
              <strong>{{ $t('client.rating.yourRating') }}:</strong>
              {{ req.customerFeedbackRating }} / 5
            </p>
          </div>
        </template>
        <template #footer>
          <div class="card-actions">
            <pv-button
                :label="$t('common.viewDetails')"
                icon="pi pi-eye"
                class="p-button-outlined p-button-sm p-button-secondary-outline"
                @click="viewRequestDetail(req)"
            />
            <pv-button
                v-if="req.status === 'resolved' && !req.customerFeedbackRating"
                :label="$t('client.rating.rateService')"
                icon="pi pi-star"
                class="p-button-warning p-button-sm p-button-rate"
                @click="openRatingForm(req)"
            />
            <pv-button
                v-if="req.status === 'pending' || req.status === 'accepted'"
                :label="$t('service.cancel')"
                icon="pi pi-times"
                class="p-button-danger p-button-sm"
                @click="cancelRequest(req)"
            />
            <pv-button
                v-if="req.status === 'completed' && req.rating"
                :label="$t('client.rating.viewRating')"
                icon="pi pi-star-fill"
                class="p-button-secondary p-button-sm p-button-view-rating"
                disabled
            />
          </div>
        </template>
      </pv-card>
    </div>

    <ServiceRequestDetailModal
        :visible="showDetailModal"
        :request="selectedRequest"
        :equipmentDisplay="selectedEquipmentDisplay"
        :locationDisplay="selectedLocationDisplay"
        @update:visible="showDetailModal = $event"
    />

    <RatingDialog
        :visible="showRatingDialog"
        :currentRating="ratingValue"
        @update:visible="showRatingDialog = $event"
        @rating-submitted="submitRating"
    />
  </div>
</template>

<style scoped>
.service-request-list {
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e7eb;
}

h1 {
  font-size: 2rem;
  color: #055f84;
  font-weight: 700;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  min-height: 200px;
  color: #6c757d;
  font-size: 1.1rem;
  text-align: center;
}

.request-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.request-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: default;
}

.request-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.request-card ::v-deep .p-card-title {
  padding: 1rem 1.5rem 0.5rem;
  font-size: 1.1rem;
  color: #34495e;
  font-weight: 600;
}

.card-title-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-title-content i {
  color: #0884c4;
  font-size: 1.25rem;
}

.request-card ::v-deep .p-card-subtitle {
  padding: 0 1.5rem 1rem;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.card-subtitle-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-subtitle-content i {
  color: #95a5a6;
  font-size: 1rem;
}

/* Status Badge inside subtitle */
.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 15px;
  font-weight: bold;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: white;
  margin-left: 0.5rem;
}

.status-pending { background-color: #f39c12; }
.status-accepted { background-color: #1abc9c; }
.status-in-progress { background-color: #3498db; }
.status-resolved { background-color: #2ecc71; }
.status-rejected { background-color: #e74c3c; }
.status-completed { background-color: #50bb0e; }


.request-card ::v-deep .p-card-content {
  padding: 0 1.5rem 1rem;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
  color: #555;
}

.detail-item i {
  color: #95a5a6;
  font-size: 1rem;
}

.detail-item strong {
  color: #333;
}

.request-card ::v-deep .p-card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e7eb;
  background-color: #fcfcfc;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.p-button-sm {
  padding: 0.55rem 1.1rem;
  font-size: 0.85rem;
  border-radius: 8px;
}

.p-button-secondary-outline {
  background-color: transparent !important;
  color: #0884c4 !important;
  border: 1px solid #0884c4 !important;
  font-weight: 600;
  transition: all 0.2s ease;
}
.p-button-secondary-outline:hover {
  background-color: #e0f2fe !important;
  color: #055f84 !important;
  border-color: #055f84 !important;
}

.p-button-rate {
  background-color: #ffc107 !important;
  border-color: #ffc107 !important;
  color: #333 !important;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.4);
  transition: all 0.2s ease;
}
.p-button-rate:hover {
  background-color: #e0a800 !important;
  border-color: #e0a800 !important;
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.5);
}

.p-button-view-rating {
  background-color: #e9ecef !important;
  border-color: #e9ecef !important;
  color: #6c757d !important;
  font-weight: 500;
  cursor: not-allowed;
}

.new-request-button {
  background-color: #0884c4;
  border: none;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease;
}

.new-request-button:hover {
  background-color: #056a9d;
}
</style>