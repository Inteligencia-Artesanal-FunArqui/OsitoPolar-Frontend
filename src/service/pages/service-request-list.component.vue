<script>
import { ServiceRequestService } from "../services/service-request.service.js";
import { EquipmentService } from "../../equipment/services/equipment.service.js";
import ServiceRequestDetailComponent from "../components/service-request/service-request-detail.component.vue";
import RatingDialog from "../components/rating/rating-dialog.component.vue";
import { formatDateTime } from "../../shared/format.js";

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

        // newest first: the API returns insertion order
        this.serviceRequests = this.serviceRequestService.mapServiceRequests(requestsResponse.data || [])
            .sort((a, b) => String(b.requestTime).localeCompare(String(a.requestTime)));
        this.equipmentList = equipmentResponse || [];
        this.loading = false;
      } catch (error) {
        console.error("Error loading data:", error);
        this.hasError = true;
        this.errorMessage = this.$t('service.error');
        this.loading = false;
      }
    },

    getEquipmentDisplay(equipmentId) {
      const match = this.equipmentList.find(eq => String(eq.id) === String(equipmentId));
      return match ? `${match.name} (${match.code || this.$t('common.noCode')})` : `${this.$t('equipment.equipmentId')}: ${equipmentId}`;
    },

    getLocationDisplay(equipmentId) {
      if (!this.equipmentList || this.equipmentList.length === 0) {
        return this.$t('service.notSpecified');
      }
      const equipment = this.equipmentList.find(e => String(e.id) === String(equipmentId));
      return equipment?.location?.name || this.$t('service.notSpecified');
    },

    formatDate(date) {
      return formatDateTime(date, this.$i18n.locale) || this.$t('service.notScheduled');
    },

    viewRequestDetail(request) {
      this.selectedRequest = request;
      const equipment = this.equipmentList.find(e => String(e.id) === String(request.equipmentId));
      this.selectedEquipmentDisplay = this.getEquipmentDisplay(request.equipmentId);
      this.selectedLocationDisplay = this.getLocationDisplay(request.equipmentId);
      this.showDetailModal = true;
    },

    openNewRequestForm() {
      this.$router.push({ name: 'new-service-request' });
    },

    openRatingForm(request) {
      this.selectedRequest = request;
      this.ratingValue = request.customerFeedbackRating || 0;
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
    <op-page-header :title="$t('service.title')" :subtitle="$t('service.subtitle')">
      <pv-button :label="$t('service.newRequest')" icon="pi pi-plus" @click="openNewRequestForm" />
    </op-page-header>

    <op-loading-state v-if="loading" :label="$t('service.loading')" />
    <op-error-state v-else-if="hasError" :message="errorMessage" @retry="loadRequests" />
    <op-empty-state
        v-else-if="serviceRequests.length === 0"
        icon="pi pi-wrench"
        :title="$t('service.emptyTitle')"
        :message="$t('service.emptyMessage')">
      <pv-button :label="$t('service.newRequest')" icon="pi pi-plus" @click="openNewRequestForm" />
    </op-empty-state>

    <div class="op-grid" v-else>
      <article v-for="req in serviceRequests" :key="req.id" class="op-card request-card">
        <header class="request-card__head">
          <div class="request-card__equipment">
            <i class="pi pi-box" aria-hidden="true"></i>
            <strong>{{ getEquipmentDisplay(req.equipmentId) }}</strong>
          </div>
          <op-status-badge kind="requestStatus" :value="req.status" />
        </header>

        <p class="request-card__title">{{ req.title }}</p>

        <dl class="request-card__facts">
          <div><dt><i class="pi pi-map-marker" aria-hidden="true"></i> {{ $t('service.location') }}</dt><dd>{{ getLocationDisplay(req.equipmentId) }}</dd></div>
          <div><dt><i class="pi pi-clock" aria-hidden="true"></i> {{ $t('service.requestedOn') }}</dt><dd>{{ formatDate(req.requestTime) }}</dd></div>
          <div><dt><i class="pi pi-calendar" aria-hidden="true"></i> {{ $t('service.scheduledFor') }}</dt><dd>{{ formatDate(req.scheduledDate) }}</dd></div>
          <div><dt><i class="pi pi-cog" aria-hidden="true"></i> {{ $t('service.serviceType') }}</dt><dd><op-status-badge kind="serviceType" :value="req.serviceType" /></dd></div>
          <div><dt><i class="pi pi-tag" aria-hidden="true"></i> {{ $t('service.priority') }}</dt><dd><op-status-badge kind="priority" :value="req.priority" /></dd></div>
          <div v-if="req.customerFeedbackRating">
            <dt><i class="pi pi-star-fill" aria-hidden="true"></i> {{ $t('client.rating.yourRating') }}</dt>
            <dd>{{ req.customerFeedbackRating }} / 5</dd>
          </div>
        </dl>

        <footer class="request-card__actions">
          <pv-button :label="$t('common.viewDetails')" icon="pi pi-eye" size="small" outlined @click="viewRequestDetail(req)" />
          <pv-button
              v-if="req.status === 'resolved' && !req.customerFeedbackRating"
              :label="$t('client.rating.rateService')"
              icon="pi pi-star"
              size="small"
              severity="warn"
              @click="openRatingForm(req)" />
          <pv-button
              v-if="req.status === 'pending' || req.status === 'accepted'"
              :label="$t('service.cancel')"
              icon="pi pi-times"
              size="small"
              severity="danger"
              text
              @click="cancelRequest(req)" />
        </footer>
      </article>
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
.request-card { display: flex; flex-direction: column; gap: var(--op-space-3); transition: box-shadow 0.2s ease, transform 0.2s ease; }
.request-card:hover { box-shadow: var(--op-shadow-md); transform: translateY(-2px); }
.request-card__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--op-space-3); }
.request-card__equipment { display: flex; gap: var(--op-space-2); align-items: flex-start; color: var(--op-text-strong); min-width: 0; }
.request-card__equipment i { color: var(--op-brand); margin-top: 0.2rem; }
.request-card__title { color: var(--op-text-muted); font-size: 0.92rem; }
.request-card__facts { display: grid; gap: var(--op-space-2); margin: 0; }
.request-card__facts > div { display: flex; justify-content: space-between; align-items: center; gap: var(--op-space-3); font-size: 0.9rem; }
.request-card__facts dt { color: var(--op-text-muted); display: flex; gap: var(--op-space-2); align-items: center; }
.request-card__facts dd { margin: 0; text-align: right; color: var(--op-text-strong); }
.request-card__actions { margin-top: auto; padding-top: var(--op-space-3); border-top: 1px solid var(--op-border); display: flex; flex-wrap: wrap; gap: var(--op-space-2); }
</style>
