<script>
/**
 * @component WorkOrderDetailModal
 * @description Modal component that displays detailed information about a work order.
 */
import { formatDateTime } from "../../shared/format.js";

export default {
  name: "WorkOrderDetailModal",

  /**
   * @props
   * @property {Boolean} visible - Controls the visibility of the dialog.
   * @property {Object} workOrder - The work order object containing all detail fields.
   * @property {String} equipmentDisplay - Readable name or description of the related equipment.
   * @property {String} locationDisplay - Readable name or description of the location.
   * @property {String} technicianDisplay - Readable name or description of the assigned technician.
   * @property {String} serviceRequestOrderNumber - The order number of the associated service request.
   */
  props: {
    visible: Boolean,
    workOrder: Object,
    equipmentDisplay: String,
    locationDisplay: String,
    technicianDisplay: String,
    serviceRequestOrderNumber: String
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
      return formatDateTime(date, this.$i18n.locale) || this.$t('workOrders.notScheduled');
    },
    /**
     * @method formatCurrency
     * @description Formats a number to a currency string.
     * @param {Number|null} value - The numerical value to format.
     * @returns {String}
     */
    formatCurrency(value) {
      if (value === null || value === undefined) return this.$t('workOrders.notRecorded');
      return new Intl.NumberFormat(this.$i18n.locale === 'es' ? 'es-PE' : 'en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
  }
};
</script>

<template>
  <pv-dialog
      :header="$t('workOrders.workOrderDetails')"
      :visible="visible"
      :modal="true"
      :closable="true"
      :style="{ width: '800px' }"
      class="work-order-detail-dialog"
      @update:visible="$emit('update:visible', $event)"
  >
    <div v-if="workOrder" class="dialog-content">
      <div class="field"><strong>{{ $t('workOrders.workOrderNumber') }}</strong><span>{{ workOrder.workOrderNumber }}</span></div>
      <div class="field"><strong>{{ $t('workOrders.statusLabel') }}</strong><op-status-badge kind="workOrderStatus" :value="workOrder.status" /></div>
      <div class="field field--wide"><strong>{{ $t('workOrders.titleLabel') }}</strong><span>{{ workOrder.title }}</span></div>
      <div class="field field--wide"><strong>{{ $t('workOrders.description') }}</strong><span>{{ workOrder.description }}</span></div>
      <div class="field field--wide"><strong>{{ $t('workOrders.issueDetails') }}</strong><span>{{ workOrder.issueDetails }}</span></div>
      <div class="field"><strong>{{ $t('service.serviceRequest') }}</strong><span>{{ serviceRequestOrderNumber }}</span></div>
      <div class="field"><strong>{{ $t('workOrders.equipment') }}</strong><span>{{ equipmentDisplay }}</span></div>
      <div class="field"><strong>{{ $t('workOrders.location') }}</strong><span>{{ locationDisplay }}</span></div>
      <div class="field"><strong>{{ $t('workOrders.assignedTechnician') }}</strong><span>{{ technicianDisplay }}</span></div>
      <div class="field"><strong>{{ $t('workOrders.serviceType') }}</strong><op-status-badge kind="serviceType" :value="workOrder.serviceType" /></div>
      <div class="field"><strong>{{ $t('workOrders.priority') }}</strong><op-status-badge kind="priority" :value="workOrder.priority" /></div>
      <div class="field"><strong>{{ $t('workOrders.creationTime') }}</strong><span>{{ formatDate(workOrder.creationTime) }}</span></div>
      <div class="field"><strong>{{ $t('workOrders.scheduledFor') }}</strong><span>{{ formatDate(workOrder.scheduledDate) }}</span></div>
      <div class="field"><strong>{{ $t('workOrders.timeSlot') }}</strong><span>{{ workOrder.timeSlot || '-' }}</span></div>
      <div class="field field--wide"><strong>{{ $t('workOrders.address') }}</strong><span>{{ workOrder.serviceAddress || $t('workOrders.notSpecified') }}</span></div>
      <div class="field"><strong>{{ $t('workOrders.desiredCompletion') }}</strong><span>{{ formatDate(workOrder.desiredCompletionDate) }}</span></div>
      <div class="field"><strong>{{ $t('workOrders.actualCompletion') }}</strong><span>{{ formatDate(workOrder.actualCompletionDate) }}</span></div>
      <div class="field field--wide"><strong>{{ $t('workOrders.resolutionDetails') }}</strong><span>{{ workOrder.resolutionDetails || $t('workOrders.notRecorded') }}</span></div>
      <div class="field field--wide"><strong>{{ $t('workOrders.technicianNotes') }}</strong><span>{{ workOrder.technicianNotes || $t('workOrders.notRecorded') }}</span></div>
      <div class="field"><strong>{{ $t('workOrders.cost') }}</strong><span>{{ formatCurrency(workOrder.cost) }}</span></div>
      <div class="field"><strong>{{ $t('workOrders.customerRating') }}</strong><span>{{ workOrder.customerFeedbackRating ? `${workOrder.customerFeedbackRating} / 5` : $t('workOrders.notProvided') }}</span></div>
      <div class="field"><strong>{{ $t('workOrders.feedbackDate') }}</strong><span>{{ formatDate(workOrder.feedbackSubmissionDate) }}</span></div>
    </div>
  </pv-dialog>
</template>

<style>
.work-order-detail-dialog .dialog-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--op-space-3);
}

.work-order-detail-dialog .field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--op-space-1);
  background: var(--op-surface-muted);
  border: 1px solid var(--op-border);
  padding: 0.65rem 0.9rem;
  border-radius: var(--op-radius-md);
}

.work-order-detail-dialog .field > strong {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--op-text-muted);
}

.work-order-detail-dialog .field--wide { grid-column: 1 / -1; }
</style>
