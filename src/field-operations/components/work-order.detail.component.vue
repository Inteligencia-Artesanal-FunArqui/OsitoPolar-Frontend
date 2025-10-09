<script>
/**
 * @component WorkOrderDetailModal
 * @description Modal component that displays detailed information about a work order.
 */
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
      if (!date) return this.$t('workOrders.notScheduled');
      return new Date(date).toLocaleDateString();
    },
    /**
     * @method formatCurrency
     * @description Formats a number to a currency string.
     * @param {Number|null} value - The numerical value to format.
     * @returns {String}
     */
    formatCurrency(value) {
      if (value === null || value === undefined) return this.$t('workOrders.notRecorded');
      return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value); // Ajusta la moneda y el formato según tu país
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
      <div class="field"><strong>{{ $t('workOrders.workOrderNumber') }}:</strong> {{ workOrder.workOrderNumber }}</div>
      <div class="field"><strong>{{ $t('workOrders.status') }}:</strong> {{ $t(`workOrders.status.${workOrder.status}`) }}</div>
      <div class="field"><strong>{{ $t('workOrders.title') }}:</strong> {{ workOrder.title }}</div>
      <div class="field"><strong>{{ $t('workOrders.description') }}:</strong> {{ workOrder.description }}</div>
      <div class="field"><strong>{{ $t('workOrders.issueDetails') }}:</strong> {{ workOrder.issueDetails }}</div>
      <div class="field"><strong>{{ $t('service.serviceRequest') }}:</strong> {{ serviceRequestOrderNumber }}</div>
      <div class="field"><strong>{{ $t('workOrders.equipment') }}:</strong> {{ equipmentDisplay }}</div>
      <div class="field"><strong>{{ $t('workOrders.location') }}:</strong> {{ locationDisplay }}</div>
      <div class="field"><strong>{{ $t('workOrders.assignedTechnician') }}:</strong> {{ technicianDisplay }}</div>
      <div class="field"><strong>{{ $t('workOrders.serviceType') }}:</strong> {{ $t(`service.form.${workOrder.serviceType}`) }}</div>
      <div class="field"><strong>{{ $t('workOrders.priority') }}:</strong> {{ $t(`workOrders.form.${workOrder.priority}`) }}</div>
      <div class="field"><strong>{{ $t('workOrders.creationTime') }}:</strong> {{ workOrder.getFormattedCreationTime() }}</div>
      <div class="field"><strong>{{ $t('workOrders.scheduledFor') }}:</strong> {{ formatDate(workOrder.scheduledDate) }}</div>
      <div class="field"><strong>{{ $t('workOrders.timeSlot') }}:</strong> {{ workOrder.timeSlot || '-' }}</div>
      <div class="field"><strong>{{ $t('workOrders.address') }}:</strong> {{ workOrder.serviceAddress || $t('workOrders.notSpecified') }}</div>
      <div class="field"><strong>{{ $t('workOrders.desiredCompletion') }}:</strong> {{ formatDate(workOrder.desiredCompletionDate) }}</div>
      <div class="field"><strong>{{ $t('workOrders.actualCompletion') }}:</strong> {{ formatDate(workOrder.actualCompletionDate) }}</div>
      <div class="field"><strong>{{ $t('workOrders.resolutionDetails') }}:</strong> {{ workOrder.resolutionDetails || $t('workOrders.notRecorded') }}</div>
      <div class="field"><strong>{{ $t('workOrders.technicianNotes') }}:</strong> {{ workOrder.technicianNotes || $t('workOrders.notRecorded') }}</div>
      <div class="field"><strong>{{ $t('workOrders.cost') }}:</strong> {{ formatCurrency(workOrder.cost) }}</div>
      <div class="field"><strong>{{ $t('workOrders.customerRating') }}:</strong> {{ workOrder.customerFeedbackRating || $t('workOrders.notProvided') }}</div>
      <div class="field"><strong>{{ $t('workOrders.feedbackDate') }}:</strong> {{ formatDate(workOrder.feedbackSubmissionDate) }}</div>
    </div>
  </pv-dialog>
</template>

<style scoped>

.dialog-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field {
  background: #f9f9f9;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>