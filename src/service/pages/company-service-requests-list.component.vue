<script>
import { ServiceRequestService } from '../services/service-request.service';
import { EquipmentService } from '../../equipment/services/equipment.service';
import { TechnicianService } from '../../field-operations/services/technician.service';
import CompanyServiceRequestCardComponent from '../components/service-request/company-service-request-card.component.vue';
import ServiceRequestDetailModal from '../../service/components/service-request/service-request-detail.component.vue';

export default {
  name: 'CompanyServiceRequestsList',
  components: {
    CompanyServiceRequestCard: CompanyServiceRequestCardComponent,
    ServiceRequestDetailModal
  },
  data() {
    return {
      serviceRequests: [],
      equipmentList: [],
      technicians: [],
      serviceRequestService: null,
      equipmentService: null,
      technicianService: null,
      loading: true,
      hasError: false,
      errorMessage: "",
      showDetailModal: false,
      selectedEquipmentDisplay: '',
      selectedLocationDisplay: '',
      selectedRequest: null
    };
  },
  methods: {
    async loadRequestsAndTechnicians() {
      this.loading = true;
      this.hasError = false;
      try {
        const [requestsResponse, equipmentResponse, techniciansResponse] = await Promise.all([
          this.serviceRequestService.getAll(),
          this.equipmentService.getAllEquipments(),
          this.technicianService.getAll()
        ]);

        this.serviceRequests = this.serviceRequestService.mapServiceRequests(requestsResponse.data)
            .sort((a, b) => String(b.requestTime).localeCompare(String(a.requestTime))); // newest first
        this.equipmentList = equipmentResponse; // already Equipment[] (no axios wrapper)
        this.technicians = this.technicianService.mapTechnicians(techniciansResponse.data);

        this.loading = false;
      } catch (error) {
        console.error("Error loading data:", error);
        this.hasError = true;
        this.errorMessage = this.$t('service.loadError');
        this.loading = false;
      }
    },
    getEquipmentDisplay(equipmentId) {
      const match = this.equipmentList.find(eq => String(eq.id) === String(equipmentId));
      return match ? `${match.name} (${match.code || this.$t('common.noCode')})` : `${this.$t('equipment.equipmentId')}: ${equipmentId}`;
    },
    viewRequestDetail(request) {
      this.selectedRequest = request;
      const equipment = this.equipmentList.find(e => String(e.id) === String(request.equipmentId));
      this.selectedEquipmentDisplay = this.getEquipmentDisplay(request.equipmentId);
      this.selectedLocationDisplay = equipment?.location?.name || this.$t('common.notSpecified');
      this.showDetailModal = true;
    }
  },
  created() {
    this.serviceRequestService = new ServiceRequestService();
    this.equipmentService = new EquipmentService();
    this.technicianService = new TechnicianService();
    this.loadRequestsAndTechnicians();
  }
};
</script>

<template>
  <div class="company-service-request-list">
    <op-page-header :title="$t('service.title')" :subtitle="$t('company.serviceRequests.subtitle')" />

    <op-loading-state v-if="loading" :label="$t('service.loading')" />
    <op-error-state v-else-if="hasError" :message="errorMessage" @retry="loadRequestsAndTechnicians" />
    <op-empty-state
        v-else-if="serviceRequests.length === 0"
        icon="pi pi-inbox"
        :title="$t('serviceRequests.noRequests')"
        :message="$t('company.serviceRequests.emptyMessage')" />

    <div class="request-grid" v-else>
      <CompanyServiceRequestCard
          v-for="req in serviceRequests"
          :key="req.id"
          :request="req"
          :equipmentDisplay="getEquipmentDisplay(req.equipmentId)"
          :locationDisplay="equipmentList.find(e => String(e.id) === String(req.equipmentId))?.location?.name || $t('common.notSpecified')"
          :allTechnicians="technicians"
          @request-updated="loadRequestsAndTechnicians"
          @view-detail="viewRequestDetail"
      />
    </div>

    <ServiceRequestDetailModal
        :visible="showDetailModal"
        :request="selectedRequest"
        :equipmentDisplay="selectedEquipmentDisplay"
        :locationDisplay="selectedLocationDisplay"
        @update:visible="showDetailModal = $event"
    />
  </div>
</template>

<style scoped>
.request-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
  gap: var(--op-space-5);
  align-items: start;
}
</style>
