<script>
import { EquipmentService } from "../services/equipment.service.js";
import { Equipment } from "../models/equipment.entity.js";
import EquipmentInfoCard from "../components/equipment-info-card.component.vue";
import EquipmentControlPanel from "../components/equipment-control-panel.component.vue";
import EquipmentFormComponent from "../components/equipment-form.component.vue";

export default {
  name: "equipment-detail",
  components: {
    EquipmentInfoCard,
    EquipmentControlPanel,
    EquipmentFormComponent
  },
  data() {
    return {
      equipment: null,
      loading: true,
      hasError: false,
      saving: false,
      isNewEquipment: false,
      isEditMode: false,
      equipmentService: new EquipmentService()
    };
  },
  computed: {
    equipmentId() {
      return this.$route.params.id;
    },

    currentView() {
      if (this.isNewEquipment) return 'form';
      if (this.isEditMode) return 'form';
      return 'detail';
    },

    pageTitle() {
      if (this.isNewEquipment) return this.$t('equipment.form.addTitle');
      if (this.isEditMode) return this.$t('equipment.form.editTitle');
      return this.equipment?.name || this.$t('equipment.detail.title');
    }
  },
  methods: {
    async loadEquipment(openEdit = false) {
      this.loading = true;
      this.hasError = false;

      try {
        if (this.equipmentId === 'new') {
          this.equipment = new Equipment({
            name: '',
            type: 'Freezer',
            model: '',
            manufacturer: '',
            serialNumber: '',
            code: '',
            cost: 0,
            technicalDetails: '',
            currentTemperature: -2.0,
            setTemperature: -2.0,
            optimalTemperatureMin: -4.0,
            optimalTemperatureMax: 0.0,
            locationName: '',
            locationAddress: '',
            locationLatitude: -12.046374,
            locationLongitude: -77.042793,
            energyConsumptionCurrent: 0,
            energyConsumptionUnit: 'watts',
            energyConsumptionAverage: 0,
            ownerId: 1,
            ownerType: 'user',
            ownershipType: 'Owned',
            notes: '',
            status: 'Active',
            isPoweredOn: false
          });

          this.isNewEquipment = true;
          this.isEditMode = false;
          this.loading = false;
          return;
        }


        this.equipment = await this.equipmentService.getEquipmentById(this.equipmentId);
        this.isNewEquipment = false;
        this.isEditMode = openEdit === true; // list "edit" button deep-links with ?edit=1
        this.loading = false;

      } catch (error) {
        console.error('Error loading equipment:', error);
        this.hasError = true;
        this.loading = false;
      }
    },

    enterEditMode() {
      this.isEditMode = true;
    },

    cancelEdit() {
      this.isEditMode = false;
      if (!this.isNewEquipment) {
        this.loadEquipment();
      }
    },


    async saveEquipment(equipmentData) {
      if (this.isNewEquipment) {
        this.$router.push('/equipment');
        return;
      }

      // The form only emits the data; persisting it is this page's job (it used to just reload and drop the edits).
      this.saving = true;
      try {
        await this.equipmentService.updateEquipment(this.equipment.id, equipmentData);
        this.$toast.add({
          severity: 'success',
          summary: this.$t('common.success'),
          detail: this.$t('equipment.form.updated', { name: equipmentData.name }),
          life: 3000
        });
        await this.loadEquipment();
      } catch (error) {
        console.error('Error saving equipment:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('common.error'),
          detail: this.$t('equipment.form.updateError'),
          life: 5000
        });
      } finally {
        this.saving = false;
      }
    },

    async updateTemperature(newTemperature) {
      if (!this.equipment || this.isNewEquipment) return;

      try {
        await this.equipmentService.updateEquipmentOperations(this.equipment.id, {
          setTemperature: newTemperature
        });
        this.equipment.setTemperature = newTemperature;
      } catch (error) {
        console.error('Error updating temperature:', error);
        this.$toast.add({ severity: 'error', summary: this.$t('common.error'), detail: this.$t('equipment.control.updateError'), life: 4000 });
      }
    },

    async togglePower(newPowerState) {
      if (!this.equipment || this.isNewEquipment) return;

      try {
        await this.equipmentService.updateEquipmentOperations(this.equipment.id, {
          isPoweredOn: newPowerState
        });
        this.equipment.isPoweredOn = newPowerState;
      } catch (error) {
        console.error('Error toggling power:', error);
        this.$toast.add({ severity: 'error', summary: this.$t('common.error'), detail: this.$t('equipment.control.updateError'), life: 4000 });
      }
    }
  },
  created() {
    this.loadEquipment(this.$route.query.edit === '1');
  },
  watch: {
    '$route.params.id'(newId, oldId) {
      if (newId !== oldId) {
        this.loadEquipment(this.$route.query.edit === '1');
      }
    }
  }
};
</script>

<template>
  <div class="equipment-detail">
    <op-page-header :title="pageTitle" :subtitle="currentView === 'detail' ? $t('equipment.detail.subtitle') : ''" back-to="/equipment" :back-label="$t('equipment.backToList')">
      <template v-if="isNewEquipment">
        <pv-button :label="$t('common.cancel')" severity="secondary" outlined :disabled="saving" @click="$router.push('/equipment')" />
      </template>
      <template v-else-if="currentView === 'detail' && equipment">
        <pv-button :label="$t('equipment.detail.analytics')" icon="pi pi-chart-line" severity="secondary" outlined @click="$router.push({ name: 'equipment-analytics', params: { id: equipment.id } })" />
        <pv-button :label="$t('equipment.detail.edit')" icon="pi pi-pencil" @click="enterEditMode" />
      </template>
      <template v-else-if="isEditMode">
        <pv-button :label="$t('common.cancel')" severity="secondary" outlined :disabled="saving" @click="cancelEdit" />
      </template>
    </op-page-header>

    <op-loading-state v-if="loading" :label="$t('equipment.detail.loading')" />
    <op-error-state v-else-if="hasError" :message="$t('equipment.detail.loadError')" @retry="loadEquipment()" />

    <div v-else-if="equipment" class="equipment-content">
      <div v-if="currentView === 'form'" class="form-view">
        <equipment-form-component
            :equipment="equipment"
            :is-edit-mode="!isNewEquipment"
            :loading="saving"
            @save="saveEquipment"
            @cancel="isNewEquipment ? $router.push('/equipment') : cancelEdit()"
        />
      </div>

      <div v-else class="detail-view">
        <div class="content-grid">
          <div class="info-section">
            <equipment-info-card :equipment="equipment" />
          </div>

          <div class="control-section">
            <equipment-control-panel
                :equipment="equipment"
                @update-temperature="updateTemperature"
                @toggle-power="togglePower"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-view { max-width: 900px; margin: 0 auto; }

.detail-view .content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
  gap: var(--op-space-6);
  align-items: start;
}
</style>
