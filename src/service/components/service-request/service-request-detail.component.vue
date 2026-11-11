<script>
/**
 * @component ServiceRequestDetailModal
 * @description Modal component that displays detailed information about a service request.
 */
import { formatDateTime } from "../../../shared/format.js";

export default {
  name: "ServiceRequestDetailModal",

  /**
   * @props
   * @property {Boolean} visible - Controls the visibility of the dialog.
   * @property {Object} request - The service request object containing all detail fields.
   * @property {String} equipmentDisplay - Readable name or description of the related equipment.
   * @property {String} locationDisplay - Readable name or description of the location.
   */
  props: {
    visible: Boolean,
    request: Object,
    equipmentDisplay: String,
    locationDisplay: String
  },

  /**
   * @emits update:visible - Emitted when the visibility of the dialog changes.
   */
  emits: ["update:visible"],

  methods: {
    /**
     * @method formatDate
     * @description Converts a date to a human-readable localized string. Returns "Not defined" if date is invalid.
     * @param {String|Date} date - The date to format.
     * @returns {String}
     */
    formatDate(date) {
      return formatDateTime(date, this.$i18n.locale) || this.$t('service.notScheduled');
    }
  }
};
</script>

<template>
  <pv-dialog
      :header="$t('service.requestDetails')"
      :visible="visible"
      :modal="true"
      :closable="true"
      :style="{ width: '700px' }"
      class="detail-dialog"
      @update:visible="$emit('update:visible', $event)"
  >
    <div v-if="request" class="dialog-content">
      <div class="field"><strong>{{ $t('service.orderNumber') }}</strong><span>{{ request.orderNumber || request.id }}</span></div>
      <div class="field"><strong>{{ $t('service.statusLabel') }}</strong><op-status-badge kind="requestStatus" :value="request.status" /></div>
      <div class="field field--wide"><strong>{{ $t('service.description') }}</strong><span>{{ request.description }}</span></div>
      <div class="field"><strong>{{ $t('service.equipment') }}</strong><span>{{ equipmentDisplay }}</span></div>
      <div class="field"><strong>{{ $t('service.location') }}</strong><span>{{ locationDisplay }}</span></div>
      <div class="field"><strong>{{ $t('service.serviceType') }}</strong><op-status-badge kind="serviceType" :value="request.serviceType" /></div>
      <div class="field"><strong>{{ $t('service.priority') }}</strong><op-status-badge kind="priority" :value="request.priority" /></div>
      <div class="field"><strong>{{ $t('service.urgency') }}</strong><op-status-badge kind="urgency" :value="request.urgency" /></div>
      <div class="field"><strong>{{ $t('service.asap') }}</strong><span>{{ request.isEmergency ? $t('service.yes') : $t('service.no') }}</span></div>
      <div class="field" v-if="!request.isEmergency"><strong>{{ $t('service.scheduledFor') }}</strong><span>{{ formatDate(request.scheduledDate) }}</span></div>
      <div class="field" v-if="!request.isEmergency"><strong>{{ $t('service.timeSlot') }}</strong><span>{{ request.timeSlot || '-' }}</span></div>
      <div class="field field--wide"><strong>{{ $t('service.address') }}</strong><span>{{ request.serviceAddress || $t('service.notSpecified') }}</span></div>
      <div class="field"><strong>{{ $t('service.technician') }}</strong><span>{{ request.assignedTechnicianId ? `${$t('technicians.technicianId')}: ${request.assignedTechnicianId}` : $t('service.notAssigned') }}</span></div>
      <div class="field"><strong>{{ $t('service.completed') }}</strong><span>{{ request.actualCompletionDate ? formatDate(request.actualCompletionDate) : '-' }}</span></div>
    </div>
  </pv-dialog>
</template>

<style>
.detail-dialog .dialog-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--op-space-3);
}

.detail-dialog .field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--op-space-1);
  background: var(--op-surface-muted);
  border: 1px solid var(--op-border);
  padding: 0.65rem 0.9rem;
  border-radius: var(--op-radius-md);
}

.detail-dialog .field > strong {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--op-text-muted);
}

.detail-dialog .field--wide { grid-column: 1 / -1; }
</style>
