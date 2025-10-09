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
      if (this.isNewEquipment) return 'Create New Equipment';
      if (this.isEditMode) return 'Edit Equipment';
      return 'Equipment Details';
    }
  },
  methods: {
    async loadEquipment() {
      this.loading = true;
      this.hasError = false;

      try {
        if (this.equipmentId === 'new') {
          console.log('🆕 Creating new equipment form');

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


        console.log(` Loading equipment: ${this.equipmentId}`);
        this.equipment = await this.equipmentService.getEquipmentById(this.equipmentId);
        this.isNewEquipment = false;
        this.isEditMode = false;
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
      try {
        if (this.isNewEquipment) {

          this.$router.push('/equipment');
        } else {

          this.isEditMode = false;

          await this.loadEquipment();
        }
      } catch (error) {
        console.error('Error in saveEquipment callback:', error);
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
      }
    }
  },
  created() {
    this.loadEquipment();
  },
  watch: {
    '$route.params.id'(newId, oldId) {
      if (newId !== oldId) {
        this.loadEquipment();
      }
    }
  }
};
</script>

<template>
  <div class="equipment-detail">
    <div class="page-header">
      <h1>{{ pageTitle }}</h1>

      <div class="header-actions">
        <template v-if="isNewEquipment">
          <pv-button
              label="Cancel"
              @click="$router.push('/equipment')"
              class="p-button-secondary"
              :disabled="saving"
          />
        </template>

        <template v-else-if="!isNewEquipment && currentView === 'detail'">
          <pv-button
              label="Edit Equipment"
              @click="enterEditMode"
              class="p-button-primary"
              icon="pi pi-pencil"
          />
        </template>

        <template v-else-if="isEditMode">
          <pv-button
              label="Cancel"
              @click="cancelEdit"
              class="p-button-secondary"
              :disabled="saving"
          />
        </template>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <pv-progress-spinner />
      <p>Loading equipment...</p>
    </div>

    <div v-else-if="hasError" class="error-container">
      <pv-message severity="error" :closable="false">
        <p>Error loading equipment. Please try again.</p>
      </pv-message>
      <pv-button label="Retry" @click="loadEquipment" class="p-button-secondary" />
    </div>


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
.equipment-detail {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.page-header h1 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  text-align: center;
}

.equipment-content {
  width: 100%;
}

.form-view {
  max-width: 800px;
  margin: 0 auto;
}

.detail-view .content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .detail-view .content-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }
}
</style>