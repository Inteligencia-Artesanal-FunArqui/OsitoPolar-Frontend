<script>
import { ServiceRequestService } from '../../services/service-request.service';
import { TechnicianService } from "../../../field-operations/services/technician.service.js";
import { Technician } from "../../../field-operations/models/technician.entity.js";

export default {
  name: 'CompanyServiceRequestCard',
  props: {
    request: {
      type: Object,
      required: true
    },
    equipmentDisplay: String,
    locationDisplay: String,
    allTechnicians: {
      type: Array,
      default: () => []
    }
  },
  emits: ['request-updated', 'view-detail'],
  data() {
    return {
      serviceRequestService: new ServiceRequestService(),
      technicianService: new TechnicianService(),
      selectedTechnicianId: null,
      showAssignDialog: false
    };
  },
  methods: {
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
    async acceptRequest() {
      this.showAssignDialog = true;
    },
    async rejectRequest() {
      this.$confirm.require({
        message: this.$t('company.serviceRequests.confirmReject'),
        header: this.$t('company.serviceRequests.rejectRequest'),
        icon: 'pi pi-times-circle',
        acceptLabel: this.$t('common.yes'),
        rejectLabel: this.$t('common.no'),
        accept: async () => {
          try {
            await this.serviceRequestService.rejectRequest(this.request.id);

            this.$toast.add({
              severity: 'success',
              summary: this.$t('common.success'),
              detail: this.$t('company.serviceRequests.rejectSuccess'),
              life: 3000
            });
            this.$emit('request-updated');
          } catch (error) {
            console.error('Error rejecting request:', error);
            this.$toast.add({
              severity: 'error',
              summary: this.$t('common.error'),
              detail: this.$t('company.serviceRequests.rejectError'),
              life: 3000
            });
          }
        }
      });
    },
    async assignTechnician() {
      if (!this.selectedTechnicianId) {
        this.$toast.add({
          severity: 'warn',
          summary: this.$t('common.warning'),
          detail: this.$t('company.serviceRequests.selectTechnicianPrompt'),
          life: 3000
        });
        return;
      }
      try {
        await this.serviceRequestService.assignTechnician(
            this.request.id,
            this.selectedTechnicianId
        );

        this.$toast.add({
          severity: 'success',
          summary: this.$t('common.success'),
          detail: this.$t('company.serviceRequests.acceptSuccess'),
          life: 3000
        });
        this.$emit('request-updated');
        this.showAssignDialog = false;
        this.selectedTechnicianId = null;
      } catch (error) {
        console.error('Error assigning technician:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('common.error'),
          detail: this.$t('company.serviceRequests.assignError'),
          life: 3000
        });
      }
    },
    async markAsResolved() {
      this.$confirm.require({
        message: this.$t('company.serviceRequests.confirmResolve'),
        header: this.$t('company.serviceRequests.resolveRequest'),
        icon: 'pi pi-check-circle',
        acceptLabel: this.$t('common.yes'),
        rejectLabel: this.$t('common.no'),
        accept: async () => {
          try {
            await this.serviceRequestService.updateStatus(this.request.id, 4); // 4 = Resolved
            this.$toast.add({
              severity: 'success',
              summary: this.$t('common.success'),
              detail: this.$t('company.serviceRequests.resolveSuccess'),
              life: 3000
            });
            this.$emit('request-updated');
          } catch (error) {
            console.error('Error resolving request:', error);
            this.$toast.add({
              severity: 'error',
              summary: this.$t('common.error'),
              detail: this.$t('company.serviceRequests.resolveError'),
              life: 3000
            });
          }
        }
      });
    },
    viewDetail() {
      this.$emit('view-detail', this.request);
    },
    getTechnicianName(id) {
      const technician = this.allTechnicians.find(tech => String(tech.id) === String(id));
      return technician ? technician.name : this.$t('service.notAssigned');
    }
  },
  async created() {
    if (this.allTechnicians.length === 0) {
      try {
        const response = await this.technicianService.getAll();
      } catch (error) {
        console.error('Error loading technicians:', error);
      }
    }
  }
};
</script>

<template>
  <pv-card class="request-card company-card">
    <template #header>
      <div class="card-header-content">
        <div class="request-id">#{{ request.orderNumber || request.id.substring(0, 8) }}</div>
        <div :class="['status-badge', request.getStatusBadgeClass()]">
          {{ $t(`service.status.${request.status}`) }}
        </div>
      </div>
    </template>

    <template #title>
      <div class="equipment-info">
        <i class="pi pi-wrench"></i>
        <span>{{ equipmentDisplay }}</span>
      </div>
    </template>

    <template #subtitle>
      <div class="location-info">
        <i class="pi pi-map-marker"></i>
        <span>{{ locationDisplay || $t('service.notSpecified') }}</span>
      </div>
    </template>

    <template #content>
      <div class="details-grid">
        <div class="detail-item">
          <i class="pi pi-calendar"></i>
          <strong>{{ $t('service.requestedOn') }}:</strong>
          <span>{{ formatDate(request.requestTime) }}</span>
        </div>
        <div class="detail-item">
          <i class="pi pi-list"></i>
          <strong>{{ $t('service.serviceType') }}:</strong>
          <span>{{ request.serviceType }}</span>
        </div>
        <div class="detail-item">
          <i class="pi pi-tag"></i>
          <strong>{{ $t('service.priority') }}:</strong>
          <span>{{ request.priority }}</span>
        </div>
        <div class="detail-item">
          <i class="pi pi-exclamation-circle"></i>
          <strong>{{ $t('service.urgency') }}:</strong>
          <span>{{ request.urgency }}</span>
        </div>
        <div class="detail-item full-width">
          <i class="pi pi-comment"></i>
          <strong>{{ $t('service.description') }}:</strong>
          <span>{{ request.description }}</span>
        </div>
        <div class="detail-item full-width" v-if="request.scheduledDate && !request.asap">
          <i class="pi pi-hourglass"></i>
          <strong>{{ $t('service.scheduledFor') }}:</strong>
          <span>{{ formatDate(request.scheduledDate) }} ({{ request.timeSlot || '-' }})</span>
        </div>
        <div class="detail-item full-width" v-if="request.technicianId">
          <i class="pi pi-user"></i>
          <strong>{{ $t('service.technician') }}:</strong>
          <span>{{ getTechnicianName(request.technicianId) }}</span>
        </div>
        <div class="detail-item full-width" v-if="request.status === 'completed' && request.rating">
          <i class="pi pi-star-fill" style="color: gold;"></i>
          <strong>{{ $t('client.rating.yourRating') }}:</strong>
          <span>{{ request.rating }} / 5</span>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="card-actions">
        <pv-button :label="$t('common.viewDetails')" icon="pi pi-eye" class="p-button-text p-button-sm" @click="viewDetail" />

        <template v-if="request.status === 'pending'">
          <pv-button
              :label="$t('company.serviceRequests.accept')"
              icon="pi pi-check"
              class="p-button-success p-button-sm"
              @click="acceptRequest"
          />
          <pv-button
              :label="$t('company.serviceRequests.reject')"
              icon="pi pi-times"
              class="p-button-danger p-button-sm"
              @click="rejectRequest"
          />
        </template>

        <template v-else-if="request.status === 'accepted' || request.status === 'in_progress'">
          <pv-button
              :label="$t('company.serviceRequests.markResolved')"
              icon="pi pi-check-double"
              class="p-button-info p-button-sm"
              @click="markAsResolved"
          />
        </template>

        <template v-else-if="request.status === 'resolved'">
          <span class="status-message">{{ $t('company.serviceRequests.waitingForRating') }}</span>
        </template>

        <template v-else-if="request.status === 'completed'">
          <span class="status-message-completed">{{ $t('company.serviceRequests.rated') }}</span>
        </template>
      </div>
    </template>
  </pv-card>

  <pv-dialog
      :header="$t('company.serviceRequests.assignTechnician')"
      v-model:visible="showAssignDialog"
      :modal="true"
      :style="{ width: '400px' }"
      @hide="selectedTechnicianId = null"
  >
    <div class="p-fluid">
      <label for="technician-select" class="dialog-label">{{ $t('company.serviceRequests.selectTechnician') }}</label>
      <pv-dropdown
          id="technician-select"
          v-model="selectedTechnicianId"
          :options="allTechnicians"
          optionLabel="name"
          optionValue="id"
          :placeholder="$t('company.serviceRequests.selectTechnicianPlaceholder')"
      />
    </div>
    <template #footer>
      <pv-button :label="$t('common.cancel')" icon="pi pi-times" class="p-button-text" @click="showAssignDialog = false" />
      <pv-button :label="$t('company.serviceRequests.assign')" icon="pi pi-user-plus" class="p-button-primary" @click="assignTechnician" />
    </template>
  </pv-dialog>

  <pv-confirm-dialog />
  <pv-toast />
</template>

<style scoped>

.request-id {
  font-size: 1.1rem;
  font-weight: 700;
  color: #055f84;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: white;
}

.status-pending { background-color: #f39c12; }
.status-accepted { background-color: #1abc9c; }
.status-in-progress { background-color: #3498db; }
.status-resolved { background-color: #2ecc71; }
.status-rejected { background-color: #e74c3c; }
.status-completed { background-color: #50bb0e; }

.equipment-info i, .location-info i {
  color: #0884c4;
  font-size: 1.1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  font-size: 0.9rem;
  color: #555;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-item i {
  color: #95a5a6;
  font-size: 1rem;
}

.detail-item strong {
  color: #333;
  min-width: 80px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.p-button-sm {
  padding: 0.6rem 1.2rem;
  font-size: 0.85rem;
  border-radius: 8px;
}

.p-button-success {
  background-color: #28a745;
  border-color: #28a745;
}
.p-button-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}
.p-button-info {
  background-color: #17a2b8;
  border-color: #17a2b8;
}
.p-button-text {
  color: #0884c4;
}

.status-message {
  font-weight: 600;
  color: #f39c12;
  font-size: 0.9rem;
  flex-grow: 1;
  text-align: right;
}

.status-message-completed {
  font-weight: 600;
  color: #50bb0e;
  font-size: 0.9rem;
  flex-grow: 1;
  text-align: right;
}

.dialog-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
  color: #333;
}

.p-dialog .p-dropdown {
  width: 100%;
}

.p-dialog-footer .p-button {
  margin-left: 0.5rem;
}
</style>