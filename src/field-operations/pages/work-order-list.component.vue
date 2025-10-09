<script>
import { WorkOrderService } from "../services/work-order.service.js";
import { EquipmentService } from "../../equipment/services/equipment.service.js";
import { TechnicianService} from "../services/technician.service.js";
import WorkOrderDetailComponent from "../components/work-order.detail.component.vue";
import { ServiceRequestService } from "../../service/services/service-request.service.js";

export default {
  name: "work-order-list",
  components: {
    WorkOrderDetailModal: WorkOrderDetailComponent,
  },
  data() {
    return {
      workOrders: [],
      equipmentList: [],
      technicianList: [],
      serviceRequestList: [],
      workOrderService: null,
      equipmentService: null,
      technicianService: null,
      serviceRequestService: null,
      loading: true,
      hasError: false,
      errorMessage: "",
      showDetailModal: false,
      selectedWorkOrder: null,
      selectedEquipmentDisplay: '',
      selectedLocationDisplay: '',
      selectedTechnicianDisplay: '',
      selectedServiceRequestOrderNumber: ''
    };
  },
  methods: {
    async loadWorkOrders() {
      this.loading = true;
      this.hasError = false;

      try {
        const [workOrdersResponse, equipmentResponse, technicianResponse, serviceRequestResponse] = await Promise.all([
          this.workOrderService.getAll(),
          this.equipmentService.getAll(),
          this.technicianService.getAll(),
          this.serviceRequestService.getAll()
        ]);

        this.workOrders = this.workOrderService.mapWorkOrders(workOrdersResponse.data);
        this.equipmentList = this.equipmentService.mapEquipment(equipmentResponse.data);
        this.technicianList = this.technicianService.mapTechnicians(technicianResponse.data);
        this.serviceRequestList = this.serviceRequestService.mapServiceRequests(serviceRequestResponse.data);

        this.loading = false;
      } catch (error) {
        console.error("Error loading data:", error);
        this.hasError = true;
        this.errorMessage = this.$t('workOrders.errorLoadingData');
        this.loading = false;
      }
    },

    getEquipmentDisplay(equipmentId) {
      const match = this.equipmentList.find(eq => String(eq.id) === String(equipmentId));
      return match ? `${match.name} (${match.code || this.$t('workOrders.noCode')})` : `${this.$t('equipment.equipmentId')}: ${equipmentId}`;
    },

    getTechnicianDisplay(technicianId) {
      if (!technicianId) return this.$t('technicians.notAssigned');
      const match = this.technicianList.find(tech => String(tech.id) === String(technicianId));
      return match ? match.getFullName() : `${this.$t('technicians.technicianId')}: ${technicianId}`;
    },

    getLocationDisplay(equipmentId) {
      const match = this.equipmentList.find(eq => String(eq.id) === String(equipmentId));
      return match?.location?.name || this.$t('workOrders.notSpecified');
    },

    getServiceRequestOrderNumber(serviceRequestId) {
      if (!serviceRequestId) return this.$t('workOrders.notFromServiceRequest');
      const match = this.serviceRequestList.find(sr => String(sr.id) === String(serviceRequestId));
      return match ? `#${match.orderNumber}` : `${this.$t('service.requestId')}: ${serviceRequestId}`;
    },

    formatDate(date) {
      if (!date) return this.$t('workOrders.notScheduled');
      return new Date(date).toLocaleDateString();
    },

    viewWorkOrderDetail(workOrder) {
      this.selectedWorkOrder = workOrder;
      this.selectedEquipmentDisplay = this.getEquipmentDisplay(workOrder.equipmentId);
      this.selectedLocationDisplay = this.getLocationDisplay(workOrder.equipmentId);
      this.selectedTechnicianDisplay = this.getTechnicianDisplay(workOrder.assignedTechnicianId);
      this.selectedServiceRequestOrderNumber = this.getServiceRequestOrderNumber(workOrder.serviceRequestId);
      this.showDetailModal = true;
    },

    openNewWorkOrderForm() {
      this.$router.push({ name: 'new-work-order' });
    },
  },
  created() {
    this.workOrderService = new WorkOrderService();
    this.equipmentService = new EquipmentService();
    this.technicianService = new TechnicianService();
    this.serviceRequestService = new ServiceRequestService();
    this.loadWorkOrders();
  }
};
</script>

<template>
  <div class="work-order-list">
    <div class="page-header">
      <h1 class="page-title">{{ $t('workOrders.title') }}</h1>
      <pv-button
          :label="$t('workOrders.newWorkOrder')"
          icon="pi pi-plus"
          class="p-button-primary new-work-order-button"
          @click="openNewWorkOrderForm"
      />
    </div>

    <div class="loading" v-if="loading">
      <pv-progress-spinner />
      <p>{{ $t('workOrders.loading') }}</p>
    </div>

    <div class="error" v-else-if="hasError">
      <p>{{ errorMessage }}</p>
      <pv-button :label="$t('common.retry')" @click="loadWorkOrders" />
    </div>

    <div class="work-order-grid" v-else>
      <pv-card
          v-for="wo in workOrders"
          :key="wo.id"
          class="work-order-card"
          @click="viewWorkOrderDetail(wo)"
      >
        <template #title>
          <div class="title-and-status">
            <p class="work-order-number-info">
              <i class="pi pi-tags"></i> <strong>{{ $t('workOrders.workOrderNumber') }}:</strong> {{ wo.workOrderNumber }}
            </p>
            <div class="status-badge-container">
              <span :class="wo.getStatusBadgeClass()">
                {{ $t(`workOrders.status.${wo.status}`) }}
              </span>
            </div>
          </div>
        </template>
        <template #content>
          <p class="attribute-line"><i class="pi pi-box"></i> <strong>{{ $t('equipment.equipment') }}:</strong> {{ getEquipmentDisplay(wo.equipmentId) }}</p>
          <p class="attribute-line"><i class="pi pi-map-marker"></i> <strong>{{ $t('common.location') }}:</strong> {{ getLocationDisplay(wo.equipmentId) }}</p>
          <p class="attribute-line"><i class="pi pi-user-plus"></i> <strong>{{ $t('technicians.assignedTechnician') }}:</strong> {{ getTechnicianDisplay(wo.assignedTechnicianId) }}</p>
          <p class="attribute-line"><i class="pi pi-calendar"></i> <strong>{{ $t('workOrders.scheduledFor') }}:</strong> {{ formatDate(wo.scheduledDate) }}</p>
          <p class="attribute-line"><i class="pi pi-file-alt"></i> <strong>{{ $t('service.serviceRequest') }}:</strong> {{ getServiceRequestOrderNumber(wo.serviceRequestId) }}</p>
        </template>
      </pv-card>
    </div>

    <WorkOrderDetailModal
        :visible="showDetailModal"
        :workOrder="selectedWorkOrder"
        :equipmentDisplay="selectedEquipmentDisplay"
        :locationDisplay="selectedLocationDisplay"
        :technicianDisplay="selectedTechnicianDisplay"
        :serviceRequestOrderNumber="selectedServiceRequestOrderNumber"
        @update:visible="showDetailModal = $event"
    />
  </div>
</template>

---

<style scoped>
.work-order-list {
  padding: 1rem;
  background-color: #f4f4f4;
}

.page-header {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  color: #007bff;
  font-size: 2rem;
  font-weight: bold;
}

.loading,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.work-order-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: flex-start;
  padding-left: 1rem;
}

.work-order-card {
  cursor: pointer;
  transition: box-shadow 0.2s ease;
  width: 98%;
  max-width: 950px;
  background-color: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  padding: 1.2rem;
  margin-left: 0.5rem;
  position: relative;
}

.work-order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.title-and-status {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 0.5rem;
  min-height: 2.5em;
}

.work-order-number-info {
  margin: 0;
  font-size: 1.1rem;
  flex-grow: 1;
}

.status-badge-container {
  position: absolute;
  right: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.work-order-card .p-card-content {
  padding-right: 60px;
}


.work-order-card strong {
  font-weight: 600;
}

.attribute-line {
  font-size: 1.05rem;
  margin-bottom: 0.8rem;
  margin-top: 0;
}

.new-work-order-button {
  background-color: #0884c4;
  border: none;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease;
}

.new-work-order-button:hover {
  background-color: #005f99;
}
.status-created { color: #f39c12; font-weight: bold; }
.status-assigned { color: #3498db; font-weight: bold; }
.status-in-progress { color: #2980b9; font-weight: bold; }
.status-on-hold { color: #f1c40f; font-weight: bold; }
.status-resolved { color: #2ecc71; font-weight: bold; }
.status-completed { color: #27ae60; font-weight: bold; }
.status-cancelled { color: #e74c3c; font-weight: bold; }
</style>