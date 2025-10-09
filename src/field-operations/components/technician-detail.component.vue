<script>
/**
 * @component TechnicianDetailModal
 * @description Modal component that displays detailed information about a technician.
 */
export default {
  name: "TechnicianDetailModal",

  /**
   * @props
   * @property {Boolean} visible - Controls the visibility of the dialog.
   * @property {Object} technician - The technician object containing all detail fields.
   */
  props: {
    visible: Boolean,
    technician: Object,
  },

  /**
   * @emits update:visible - Emitted when the visibility of the dialog changes.
   */
  emits: ["update:visible"],
};
</script>

<template>
  <pv-dialog
      :header="$t('technicians.technicianDetails')" :visible="visible"
      :modal="true"
      :closable="true"
      :style="{ width: '500px' }"
      class="technician-detail-dialog"
      @update:visible="$emit('update:visible', $event)"
  >
    <div v-if="technician" class="dialog-content">
      <div class="field"><i class="pi pi-user field-icon"></i><strong>{{ $t('technicians.name') }}:</strong> <span class="field-value">{{ technician.name }}</span></div>
      <div class="field"><i class="pi pi-tag field-icon"></i><strong>{{ $t('technicians.specialization') }}:</strong> <span class="field-value">{{ technician.specialization }}</span></div>
      <div class="field"><i class="pi pi-phone field-icon"></i><strong>{{ $t('technicians.phone') }}:</strong> <span class="field-value">{{ technician.phone }}</span></div>
      <div class="field"><i class="pi pi-at field-icon"></i><strong>{{ $t('technicians.email') }}:</strong> <span class="field-value">{{ technician.email }}</span></div>
      <div class="field"><i class="pi pi-star field-icon"></i><strong>{{ $t('technicians.averageRating') }}:</strong> <span class="field-value">{{ technician.getAverageRating() }}</span></div>
      <div class="field"><i class="pi pi-building field-icon"></i><strong>{{ $t('technicians.company') }}:</strong> <span class="field-value">{{ technician.companyId }}</span></div>
      <div class="field"><i class="pi pi-globe field-icon"></i><strong>{{ $t('technicians.availability') }}:</strong>
        <span :class="technician.getAvailabilityClass()">
          {{ technician.getAvailabilityStatus() }}
        </span>
      </div>
    </div>
  </pv-dialog>
</template>

<style scoped>

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.field {
  background: #f0f4f7;
  padding: 0.9rem 1.2rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.05rem;
  color: #343a40;
}

.field strong {
  color: #0056b3;
  font-weight: 600;
  flex-shrink: 0;
}

.field-icon {
  font-size: 1.25rem;
  color: #007bff;
  margin-right: 0.2rem;
}

.field-value {
  flex-grow: 1;
}

.status-available {
  color: #28a745;
  font-weight: 600;
  background-color: #e6ffe6;
  padding: 0.2em 0.6em;
  border-radius: 4px;
}

.status-occupied {
  color: #ffc107;
  font-weight: 600;
  background-color: #fff9e6;
  padding: 0.2em 0.6em;
  border-radius: 4px;
}

.status-on-leave {
  color: #dc3545;
  font-weight: 600;
  background-color: #ffe6e6;
  padding: 0.2em 0.6em;
  border-radius: 4px;
}

.status-unknown {
  color: #6c757d;
  font-weight: 600;
  background-color: #f2f2f2;
  padding: 0.2em 0.6em;
  border-radius: 4px;
}
</style>