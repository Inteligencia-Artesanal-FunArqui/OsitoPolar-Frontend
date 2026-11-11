// equipment-form.page.vue
<script>
import { EquipmentService } from "../services/equipment.service.js";
import EquipmentForm from "../components/equipment-form.component.vue";

/**
 * @component equipment-form-page
 * @description Page to add or edit equipment details
 */
export default {
  name: "equipment-form-page",
  components: {
    EquipmentForm
  },
  data() {
    return {
      /**
       * @type {Object|null}
       * @description Equipment data for editing
       */
      equipmentData: null,

      /**
       * @type {EquipmentService}
       * @description Service for equipment operations
       */
      equipmentService: null,

      /**
       * @type {Boolean}
       * @description Whether we are in edit mode
       */
      isEditMode: false,

      /**
       * @type {Boolean}
       * @description Loading state for fetching equipment
       */
      loading: false
    };
  },
  computed: {
    /**
     * Gets the equipment ID from the route params
     * @returns {string|null} Equipment ID or null if creating new
     */
    equipmentId() {
      return this.$route.params.id;
    }
  },
  methods: {
    /**
     * Load equipment data if in edit mode
     */
    loadEquipment() {
      if (!this.equipmentId) return;

      this.loading = true;
      this.equipmentService.getEquipmentById(this.equipmentId)
          .then(equipment => {
            this.equipmentData = equipment;
            this.loading = false;
          })
          .catch(error => {
            console.error('Error loading equipment:', error);
            this.$toast.add({
              severity: 'error',
              summary: this.$t('common.error'),
              detail: this.$t('equipment.detail.loadError'),
              life: 5000
            });
            this.loading = false;
          });
    },

    /**
     * Handle save from the form component
     * @param {Object} equipmentData - The equipment data to save
     */
    handleSave(equipmentData) {
      // Call API based on mode
      const savePromise = this.isEditMode
          ? this.equipmentService.updateEquipment(equipmentData.id, equipmentData)
          : this.equipmentService.createEquipment(equipmentData);

      savePromise
          .then(() => {
            const message = this.isEditMode
                ? this.$t('equipment.form.updated', { name: equipmentData.name })
                : this.$t('equipment.form.created', { name: equipmentData.name });

            this.$toast.add({
              severity: 'success',
              summary: this.$t('common.success'),
              detail: message,
              life: 3000
            });

            this.$router.push('/equipment');
          })
          .catch(error => {
            console.error('Error saving equipment:', error);
            this.$toast.add({
              severity: 'error',
              summary: this.$t('common.error'),
              detail: this.isEditMode ? this.$t('equipment.form.updateError') : this.$t('equipment.form.createError'),
              life: 5000
            });
          });
    },

    /**
     * Handle cancel from the form component
     */
    handleCancel() {
      this.$router.push('/equipment');
    }
  },
  created() {
    this.equipmentService = new EquipmentService();
    this.isEditMode = !!this.equipmentId;

    if (this.isEditMode) {
      this.loadEquipment();
    }
  }
};
</script>

<template>
  <div class="equipment-form-page">
    <op-page-header
        :title="isEditMode ? $t('equipment.form.editTitle') : $t('equipment.form.addTitle')"
        :subtitle="$t('equipment.form.subtitle')"
        back-to="/equipment"
        :back-label="$t('equipment.backToList')" />
    <equipment-form
        :equipment="equipmentData"
        :is-edit-mode="isEditMode"
        :loading="loading"
        @save="handleSave"
        @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.equipment-form-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>