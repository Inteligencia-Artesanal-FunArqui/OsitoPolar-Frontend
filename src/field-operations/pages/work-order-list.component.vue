<script>
import { formatDateTime } from "../../shared/format.js";
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
          this.equipmentService.getAllEquipments(),
          this.technicianService.getAll(),
          this.serviceRequestService.getAll()
        ]);

        this.workOrders = this.workOrderService.mapWorkOrders(workOrdersResponse.data)
          .sort((a, b) => String(b.creationTime).localeCompare(String(a.creationTime))); // newest first
        this.equipmentList = equipmentResponse; // already Equipment[]
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
      return match ? match.name : `${this.$t('technicians.technicianId')}: ${technicianId}`;
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
      return formatDateTime(date, this.$i18n.locale) || this.$t('workOrders.notScheduled');
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
    <op-page-header :title="$t('workOrders.title')" :subtitle="$t('workOrders.subtitle')">
      <pv-button :label="$t('workOrders.newWorkOrder')" icon="pi pi-plus" @click="openNewWorkOrderForm" />
    </op-page-header>

    <op-loading-state v-if="loading" :label="$t('workOrders.loading')" />
    <op-error-state v-else-if="hasError" :message="errorMessage" @retry="loadWorkOrders" />
    <op-empty-state
        v-else-if="workOrders.length === 0"
        icon="pi pi-clipboard"
        :title="$t('workOrders.emptyTitle')"
        :message="$t('workOrders.emptyMessage')">
      <pv-button :label="$t('workOrders.newWorkOrder')" icon="pi pi-plus" @click="openNewWorkOrderForm" />
    </op-empty-state>

    <div class="op-grid" v-else>
      <article
          v-for="wo in workOrders"
          :key="wo.id"
          class="op-card work-order-card"
          tabindex="0"
          role="button"
          @click="viewWorkOrderDetail(wo)"
          @keydown.enter="viewWorkOrderDetail(wo)">
        <header class="work-order-card__head">
          <strong class="work-order-card__number"><i class="pi pi-tags" aria-hidden="true"></i> {{ wo.workOrderNumber }}</strong>
          <op-status-badge kind="workOrderStatus" :value="wo.status" />
        </header>
        <p v-if="wo.title" class="work-order-card__title">{{ wo.title }}</p>
        <dl class="work-order-card__facts">
          <div><dt><i class="pi pi-box" aria-hidden="true"></i> {{ $t('equipment.equipment') }}</dt><dd>{{ getEquipmentDisplay(wo.equipmentId) }}</dd></div>
          <div><dt><i class="pi pi-map-marker" aria-hidden="true"></i> {{ $t('common.location') }}</dt><dd>{{ getLocationDisplay(wo.equipmentId) }}</dd></div>
          <div><dt><i class="pi pi-user-plus" aria-hidden="true"></i> {{ $t('technicians.assignedTechnician') }}</dt><dd>{{ getTechnicianDisplay(wo.assignedTechnicianId) }}</dd></div>
          <div><dt><i class="pi pi-calendar" aria-hidden="true"></i> {{ $t('workOrders.scheduledFor') }}</dt><dd>{{ formatDate(wo.scheduledDate) }}</dd></div>
          <div><dt><i class="pi pi-file-edit" aria-hidden="true"></i> {{ $t('service.serviceRequest') }}</dt><dd>{{ getServiceRequestOrderNumber(wo.serviceRequestId) }}</dd></div>
          <div><dt><i class="pi pi-tag" aria-hidden="true"></i> {{ $t('workOrders.priority') }}</dt><dd><op-status-badge kind="priority" :value="wo.priority" /></dd></div>
        </dl>
      </article>
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

<style scoped>
.work-order-card { cursor: pointer; display: flex; flex-direction: column; gap: var(--op-space-3); transition: box-shadow 0.2s ease, transform 0.2s ease; }
.work-order-card:hover { box-shadow: var(--op-shadow-md); transform: translateY(-2px); }
.work-order-card__head { display: flex; align-items: center; justify-content: space-between; gap: var(--op-space-3); }
.work-order-card__number { color: var(--op-brand-strong); }
.work-order-card__title { color: var(--op-text-muted); font-size: 0.92rem; }
.work-order-card__facts { display: grid; gap: var(--op-space-2); margin: 0; }
.work-order-card__facts > div { display: flex; justify-content: space-between; align-items: center; gap: var(--op-space-3); font-size: 0.9rem; }
.work-order-card__facts dt { color: var(--op-text-muted); display: flex; gap: var(--op-space-2); align-items: center; white-space: nowrap; }
.work-order-card__facts dd { margin: 0; text-align: right; color: var(--op-text-strong); }
</style>
