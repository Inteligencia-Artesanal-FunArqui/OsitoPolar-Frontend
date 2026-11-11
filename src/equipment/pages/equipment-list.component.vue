<script>
/**
 * Import service and models
 */
import { EquipmentService } from "../services/equipment.service.js";
import { equipmentTypeKey } from "../../shared/badge-tokens.js";

/**
 * @component equipment-list
 * @description Page component to display a list of all equipment
 */
export default {
  name: "equipment-list",
  data() {
    return {
      /**
       * @type {Array<Equipment>}
       * @description List of equipment items
       */
      equipment: [],

      /**
       * @type {EquipmentService|null}
       * @description Service for equipment operations
       */
      equipmentService: null,

      /**
       * @type {Boolean}
       * @description Loading state
       */
      loading: true,

      /**
       * @type {Boolean}
       * @description Error state
       */
      hasError: false,

      /**
       * @type {String}
       * @description Error message
       */
      errorMessage: '',

      /**
       * @type {Object|null}
       * @description Equipment being deleted
       */
      deletingEquipment: null,

      /**
       * @type {Boolean}
       * @description Whether the delete confirmation dialog is visible
       */
      showDeleteDialog: false
    };
  },
  methods: {
    /**
     * Loads all equipment from the API
     */
    loadEquipment() {
      this.loading = true;
      this.hasError = false;

      this.equipmentService.getAllEquipments()
          .then(equipments => {
            this.equipment = equipments;
            this.loading = false;
          })
          .catch(error => {
            console.error('Error loading equipment:', error);
            this.loading = false;
            this.hasError = true;
            this.errorMessage = this.$t('equipment.errorMessage');
          });
    },

    /**
     * Navigates to equipment detail page
     * @param {Object} equipment - The equipment to view
     */
    viewEquipment(equipment) {
      this.$router.push(`/equipment/${equipment.id}`);
    },

    /**
     * Gets status color based on equipment temperature status
     * @param {Object} equipment - The equipment to check
     * @returns {string} CSS class name
     */
    getStatusClass(equipment) {
      const status = equipment.getTemperatureStatus();
      return `status-${status}`;
    },

    /**
     * Navigate to add equipment page
     */
    addEquipment() {
      this.$router.push('/equipment/new');
    },

    /**
     * Navigate to edit equipment page
     * @param {Object} equipment - The equipment to edit
     * @param {Event} event - The DOM event object
     */
    typeLabel(type) {
      const key = equipmentTypeKey(type);
      return this.$te(key) ? this.$t(key) : (type || '-');
    },

    editEquipment(equipment, event) {
      // Prevent triggering card click event
      event.stopPropagation();
      this.$router.push({ name: 'equipment-detail', params: { id: equipment.id }, query: { edit: '1' } });
    },


    /**
     * Opens delete confirmation dialog
     * @param {Object} equipment - The equipment to delete
     * @param {Event} event - The DOM event object
     */
    openDeleteDialog(equipment, event) {
      // Prevent triggering card click event
      event.stopPropagation();

      this.deletingEquipment = equipment;
      this.showDeleteDialog = true;
    },

    /**
     * Confirms equipment deletion
     */
    confirmDelete() {
      if (!this.deletingEquipment) return;

      this.equipmentService.deleteEquipment(this.deletingEquipment.id)
          .then(() => {
            this.showSuccessMessage();
            this.loadEquipment();
            this.showDeleteDialog = false;
            this.deletingEquipment = null;
          })
          .catch(error => {
            console.error('Error deleting equipment:', error);
            this.showErrorMessage();
          });
    },

    /**
     * Displays a success toast notification
     */
    showSuccessMessage() {
      this.$toast.add({
        severity: 'success',
        summary: this.$t('common.success'),
        detail: this.$t('equipment.deleteSuccess', { name: this.deletingEquipment.name }),
        life: 3000
      });
    },

    /**
     * Displays an error toast notification
     */
    showErrorMessage() {
      this.$toast.add({
        severity: 'error',
        summary: this.$t('common.error'),
        detail: this.$t('equipment.deleteError'),
        life: 5000
      });
    }
  },
  created() {
    this.equipmentService = new EquipmentService();
    this.loadEquipment();
  }
}
</script>

<template>
  <div class="equipment-list">
    <op-page-header :title="$t('equipment.title')" :subtitle="$t('equipment.subtitle')">
      <pv-button :label="$t('equipment.addButton')" icon="pi pi-plus" @click="addEquipment" />
    </op-page-header>

    <op-loading-state v-if="loading" :label="$t('equipment.loading')" />
    <op-error-state v-else-if="hasError" :message="errorMessage" @retry="loadEquipment" />
    <op-empty-state
        v-else-if="equipment.length === 0"
        icon="pi pi-box"
        :title="$t('equipment.emptyTitle')"
        :message="$t('equipment.emptyMessage')">
      <pv-button :label="$t('equipment.addButton')" icon="pi pi-plus" @click="addEquipment" />
    </op-empty-state>

    <div class="op-grid" v-else>
      <article
          v-for="item in equipment"
          :key="item.id"
          class="op-card equipment-card"
          :class="getStatusClass(item)"
          tabindex="0"
          role="link"
          @click="viewEquipment(item)"
          @keydown.enter="viewEquipment(item)">
        <header class="equipment-card__head">
          <div class="equipment-card__titles">
            <h2>{{ item.name }}</h2>
            <p>{{ typeLabel(item.type) }} · {{ item.model }}</p>
          </div>
          <span class="power-indicator" :class="{ on: item.isPoweredOn }" :title="item.isPoweredOn ? $t('equipment.control.on') : $t('equipment.control.off')">
            <i class="pi pi-power-off" aria-hidden="true"></i>
          </span>
        </header>

        <div class="equipment-card__temp">
          <span class="temperature-value">{{ Number(item.currentTemperature).toFixed(1) }}°C</span>
          <op-status-badge kind="temperature" :value="item.getTemperatureStatus()" />
        </div>

        <p class="equipment-card__location">
          <i class="pi pi-map-marker" aria-hidden="true"></i>
          <span>{{ item.location.name || $t('common.notSpecified') }}</span>
        </p>

        <footer class="equipment-card__actions">
          <pv-button
              :label="$t('equipment.controlLabel')"
              icon="pi pi-cog"
              size="small"
              outlined
              @click.stop="viewEquipment(item)" />
          <span class="management-actions">
            <pv-button
                icon="pi pi-pencil"
                severity="secondary"
                text
                rounded
                :aria-label="$t('equipment.edit')"
                :title="$t('equipment.edit')"
                @click="editEquipment(item, $event)" />
            <pv-button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                :aria-label="$t('equipment.delete')"
                :title="$t('equipment.delete')"
                @click="openDeleteDialog(item, $event)" />
          </span>
        </footer>
      </article>
    </div>

    <pv-dialog
        v-model:visible="showDeleteDialog"
        :modal="true"
        :header="$t('equipment.confirmDelete')"
        :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
        <span v-if="deletingEquipment" v-html="$t('equipment.deleteConfirmation', { name: deletingEquipment.name })"></span>
      </div>
      <template #footer>
        <pv-button :label="$t('equipment.no')" icon="pi pi-times" severity="secondary" text @click="showDeleteDialog = false" />
        <pv-button :label="$t('equipment.yes')" icon="pi pi-check" severity="danger" @click="confirmDelete" />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.equipment-card {
  display: flex;
  flex-direction: column;
  gap: var(--op-space-3);
  cursor: pointer;
  border-top: 4px solid var(--op-border-strong);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.equipment-card:hover { transform: translateY(-3px); box-shadow: var(--op-shadow-md); }
.equipment-card.status-normal { border-top-color: var(--op-success); }
.equipment-card.status-warning { border-top-color: var(--op-warn); }
.equipment-card.status-critical { border-top-color: var(--op-danger); }

.equipment-card__head { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--op-space-3); }
.equipment-card__titles { min-width: 0; }
.equipment-card__titles h2 { font-size: 1.1rem; color: var(--op-text-strong); overflow-wrap: anywhere; }
.equipment-card__titles p { color: var(--op-text-muted); font-size: 0.88rem; }

.power-indicator {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  background: var(--op-surface-muted); border: 1px solid var(--op-border);
  display: grid; place-items: center; color: var(--op-text-muted); font-size: 0.8rem;
}
.power-indicator.on { background: var(--op-success); border-color: var(--op-success); color: #fff; }

.equipment-card__temp { display: flex; align-items: center; justify-content: space-between; gap: var(--op-space-3); }
.temperature-value { font-size: 2rem; font-weight: 700; color: var(--op-text-strong); line-height: 1; }

.equipment-card__location { display: flex; gap: var(--op-space-2); align-items: center; color: var(--op-text-muted); font-size: 0.9rem; }

.equipment-card__actions {
  margin-top: auto; padding-top: var(--op-space-3); border-top: 1px solid var(--op-border);
  display: flex; justify-content: space-between; align-items: center;
}
.management-actions { display: inline-flex; gap: var(--op-space-1); }

.confirmation-content { display: flex; align-items: center; gap: var(--op-space-4); margin: var(--op-space-2) 0; }
.confirmation-content .pi { font-size: 2rem; color: var(--op-warn); }
</style>
