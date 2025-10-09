<script>
/**
 * @component ServiceRequestDetailModal
 * @description Modal component that displays detailed information about a service request.
 */
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
      if (!date) return this.$t('service.notScheduled');
      return new Date(date).toLocaleDateString();
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
      <div class="field"><strong>{{ $t('service.orderNumber') }}:</strong> {{ request.orderNumber }}</div>
      <div class="field"><strong>{{ $t('service.status') }}:</strong> {{ $t(`service.status.${request.status}`) }}</div>
      <div class="field"><strong>{{ $t('service.description') }}:</strong> {{ request.description }}</div>
      <div class="field"><strong>{{ $t('service.equipment') }}:</strong> {{ equipmentDisplay }}</div>
      <div class="field"><strong>{{ $t('service.location') }}:</strong> {{ locationDisplay }}</div>
      <div class="field"><strong>{{ $t('service.serviceType') }}:</strong> {{ request.serviceType }}</div>
      <div class="field"><strong>{{ $t('service.urgency') }}:</strong> {{ request.urgency }}</div>
      <div class="field"><strong>{{ $t('service.asap') }}:</strong> {{ request.isEmergency ? $t('service.yes') : $t('service.no') }}</div>
      <div class="field" v-if="!request.asap"><strong>{{ $t('service.scheduledFor') }}:</strong> {{ formatDate(request.scheduledDate) }}</div>
      <div class="field" v-if="!request.asap"><strong>{{ $t('service.timeSlot') }}:</strong> {{ request.timeSlot || '-' }}</div>
      <div class="field"><strong>{{ $t('service.address') }}:</strong> {{ request.serviceAddress || $t('service.notSpecified') }}</div>
      <div class="field"><strong>{{ $t('service.technician') }}:</strong> {{ request.assignedTechnicianId || $t('service.notAssigned') }}</div>
      <div class="field"><strong>{{ $t('service.completed') }}:</strong> {{ formatDate(request.actualCompletionDate) }}</div>
    </div>
  </pv-dialog>
</template>

<style>
.detail-dialog .p-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.detail-dialog .p-dialog-header {
  background-color: #0884c4;
  color: #fff;
  font-weight: bold;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 1rem;
}

.detail-dialog .p-dialog-content {
  background-color: #ffffff;
  padding: 2rem;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

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
