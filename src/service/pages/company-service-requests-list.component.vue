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

        this.serviceRequests = this.serviceRequestService.mapServiceRequests(requestsResponse.data);
        this.equipmentList = equipmentResponse.data;
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
      return match ? `${match.name} (${match.code || 'No code'})` : `Equipment ID: ${equipmentId}`;
    },
    viewRequestDetail(request) {
      this.selectedRequest = request;
      const equipment = this.equipmentList.find(e => String(e.id) === String(request.equipmentId));
      this.selectedEquipmentDisplay = equipment ? `${equipment.name} (${equipment.code || 'No code'})` : `Equipment ID: ${request.equipmentId}`;
      this.selectedLocationDisplay = equipment?.location?.name || "Not specified";
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
    <div class="page-header">
      <h1>{{ $t('service.title') }}</h1>
    </div>

    <div class="loading" v-if="loading">
      <pv-progress-spinner />
      <p>{{ $t('service.loading') }}</p>
    </div>

    <div class="error" v-else-if="hasError">
      <p>{{ errorMessage }}</p>
      <pv-button :label="$t('common.retry')" @click="loadRequestsAndTechnicians" />
    </div>

    <div class="request-grid" v-else>
      <CompanyServiceRequestCard
          v-for="req in serviceRequests"
          :key="req.id"
          :request="req"
          :equipmentDisplay="getEquipmentDisplay(req.equipmentId)"
          :locationDisplay="equipmentList.find(e => e.id === req.equipmentId)?.location?.name || $t('common.notSpecified')"
          :allTechnicians="technicians"
          @request-updated="loadRequestsAndTechnicians"
          @view-detail="viewRequestDetail"
      />
      <p v-if="serviceRequests.length === 0">{{ $t('serviceRequests.noRequests') }}</p>
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
.company-service-request-list {
  padding: 1rem;
}

.page-header {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.request-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}
</style>