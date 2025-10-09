
<script>
import { EquipmentService } from "../services/equipment.service.js";

/**
 * @component equipment-form
 * @description Form for adding/editing equipment with C# API compatibility
 */
export default {
  name: "equipment-form",
  props: {
    equipment: {
      type: Object,
      default: null
    },
    isEditMode: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {

      formData: {
        name: '',
        type: '',
        model: '',
        manufacturer: '',
        serialNumber: '',
        code: '',
        cost: 0,
        technicalDetails: '',
        currentTemperature: 22,
        setTemperature: 22,
        optimalTemperatureMin: 18,
        optimalTemperatureMax: 25,
        //Ubication
        locationName: '',
        locationAddress: '',
        locationLatitude: -12.046374,
        locationLongitude: -77.042793,
        //Energy
        energyConsumptionCurrent: 0,
        energyConsumptionUnit: 'watts',
        energyConsumptionAverage: 0,
        ownerId: 1,
        ownerType: 'user',
        ownershipType: 'Owned',
        notes: ''
      },
      submitting: false,
      errors: {},
      typeOptions: [
        { label: 'Freezer', value: 'Freezer' },
        { label: 'Cold Room', value: 'ColdRoom' },
        { label: 'Refrigerator', value: 'Refrigerator' }
      ],
      statusOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Maintenance', value: 'Maintenance' },
        { label: 'Out of Service', value: 'OutOfService' }
      ],
      ownershipOptions: [
        { label: 'Owned', value: 'Owned' },
        { label: 'Rented', value: 'Rented' },
        { label: 'Leased', value: 'Leased' }
      ],
      equipmentService: null
    };
  },
  computed: {
    pageTitle() {
      return this.isEditMode ? 'Edit Equipment' : 'Add New Equipment';
    }
  },
  watch: {
    equipment: {
      immediate: true,
      handler(equipment) {
        if (equipment) {
          this.populateFormData(equipment);
        }
      }
    }
  },
  methods: {
    resetForm() {
      const generateUniqueSerial = () => {
        const fullTimestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `EQ${fullTimestamp}-${random}`;
      };


      const generateUniqueCode = () => {
        const fullTimestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `CODE${fullTimestamp}${random}`;
      };

      this.formData = {
        name: '',
        type: '',
        model: '',
        manufacturer: '',
        serialNumber: generateUniqueSerial(),
        code: generateUniqueCode(),
        cost: 0,
        technicalDetails: '',
        currentTemperature: 22,
        setTemperature: 22,
        optimalTemperatureMin: 18,
        optimalTemperatureMax: 25,
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
        notes: ''
      };

      if (this.equipment) {
        this.populateFormData(this.equipment);
      }

      this.errors = {};
    },

    populateFormData(equipment) {
      if (!equipment) {
        this.resetForm();
        return;
      }
      this.formData = {
        name: equipment.name || '',
        type: equipment.type || '',
        model: equipment.model || '',
        manufacturer: equipment.manufacturer || '',
        serialNumber: equipment.serialNumber || '',
        code: equipment.code || '',
        cost: equipment.cost || 0,
        technicalDetails: equipment.technicalDetails || '',
        currentTemperature: equipment.currentTemperature || 22,
        setTemperature: equipment.setTemperature || 22,
        optimalTemperatureMin: equipment.optimalTemperatureMin || 18,
        optimalTemperatureMax: equipment.optimalTemperatureMax || 25,

        locationName: equipment.locationName || '',
        locationAddress: equipment.locationAddress || '',
        locationLatitude: equipment.locationLatitude || -12.046374,
        locationLongitude: equipment.locationLongitude || -77.042793,

        energyConsumptionCurrent: equipment.energyConsumptionCurrent || 0,
        energyConsumptionUnit: equipment.energyConsumptionUnit || 'watts',
        energyConsumptionAverage: equipment.energyConsumptionAverage || 0,
        ownerId: equipment.ownerId || 1,
        ownerType: equipment.ownerType || 'user',
        ownershipType: equipment.ownershipType || 'owned',
        notes: equipment.notes || ''
      };
    },

    async validateForm() {
      this.errors = {};

      if (!this.formData.name?.trim()) {
        this.errors.name = 'Name is required';
      }

      if (!this.formData.type) {
        this.errors.type = 'Type is required';
      }

      if (this.formData.serialNumber?.trim()) {
        try {
          const existingEquipment = await this.equipmentService.getBySerialNumber(this.formData.serialNumber);
          if (existingEquipment && (!this.isEditMode || existingEquipment.id !== this.equipment?.id)) {
            this.errors.serialNumber = 'Serial number already exists';
          }
        } catch (error) {
          console.error('Error checking serial number:', error);
          this.errors.serialNumber = 'Failed to validate serial number';
        }
      }

      if (!this.formData.code?.trim()) {
        this.errors.code = 'Equipment code is required';
      }

      if (!this.formData.model?.trim()) {
        this.errors.model = 'Model is required';
      }

      if (!this.formData.manufacturer?.trim()) {
        this.errors.manufacturer = 'Manufacturer is required';
      }

      if (!this.formData.locationName?.trim()) {
        this.errors.locationName = 'Location name is required';
      }

      if (!this.formData.locationAddress?.trim()) {
        this.errors.locationAddress = 'Location address is required';
      }

      if (this.formData.optimalTemperatureMin >= this.formData.optimalTemperatureMax) {
        this.errors.optimalTemperature = 'Minimum temperature must be less than maximum temperature';
      }

      return Object.keys(this.errors).length === 0;
    },

    async submitForm() {
      if (this.submitting) {
        return;
      }

      const isValid = await this.validateForm();
      if (!isValid) {
        this.$toast.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please correct the errors in the form',
          life: 3000
        });
        return;
      }

      this.submitting = true;
      console.log('Preparing equipment data...');

      try {
        const equipmentData = {
          ...this.formData,
          status: 'Active',
          isPoweredOn: true,
          installationDate: new Date().toISOString()
        };

        this.$emit('save', equipmentData);

      } catch (error) {
        console.error('Error preparing equipment data:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to prepare equipment data',
          life: 5000
        });
      } finally {
        setTimeout(() => {
          this.submitting = false;
          console.log(' Submit unlocked');
        }, 1000);
      }
    },

    cancel() {
      this.$emit('cancel');
    }
  },
  created() {
    this.equipmentService = new EquipmentService();
    this.resetForm();
  }
};
</script>

<template>
  <div class="equipment-form p-fluid">
    <pv-message v-if="Object.keys(errors).length > 0" severity="error">
      Please correct the errors in the form
    </pv-message>

    <div class="form-grid">
      <!-- Basic Information -->
      <pv-field-set legend="Basic Information">
        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="name">Name*</label>
              <pv-input-text
                  id="name"
                  v-model="formData.name"
                  :class="{'p-invalid': errors.name}"
                  placeholder="Enter equipment name"
              />
              <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="type">Type*</label>
              <select
                  id="type"
                  v-model="formData.type"
                  :class="['custom-select', {'is-invalid': errors.type}]"
                  required
              >
                <option value="">-- Select Equipment Type --</option>
                <option value="Freezer">Freezer</option>
                <option value="ColdRoom">Cold Room</option>
                <option value="Refrigerator">Refrigerator</option>
              </select>
              <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="model">Model*</label>
              <pv-input-text
                  id="model"
                  v-model="formData.model"
                  :class="{'p-invalid': errors.model}"
                  placeholder="Enter model number"
              />
              <small v-if="errors.model" class="p-error">{{ errors.model }}</small>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="manufacturer">Manufacturer*</label>
              <pv-input-text
                  id="manufacturer"
                  v-model="formData.manufacturer"
                  :class="{'p-invalid': errors.manufacturer}"
                  placeholder="Enter manufacturer name"
              />
              <small v-if="errors.manufacturer" class="p-error">{{ errors.manufacturer }}</small>
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="serialNumber">Serial Number*</label>
              <pv-input-text
                  id="serialNumber"
                  v-model="formData.serialNumber"
                  :class="{'p-invalid': errors.serialNumber}"
                  placeholder="Enter serial number"
              />
              <small v-if="errors.serialNumber" class="p-error">{{ errors.serialNumber }}</small>
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="code">Equipment Code*</label>
              <pv-input-text
                  id="code"
                  v-model="formData.code"
                  :class="{'p-invalid': errors.code}"
                  placeholder="Enter equipment code"
              />
              <small v-if="errors.code" class="p-error">{{ errors.code }}</small>
            </div>
          </div>
        </div>
      </pv-field-set>

      <!-- Temperature Settings -->
      <pv-field-set legend="Temperature Settings">
        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="currentTemperature">Current Temperature (°C)</label>
              <pv-input-number
                  id="currentTemperature"
                  v-model="formData.currentTemperature"
                  :min-fraction-digits="1"
                  :max-fraction-digits="1"
                  placeholder="22.0"
              />
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="setTemperature">Set Temperature (°C)</label>
              <pv-input-number
                  id="setTemperature"
                  v-model="formData.setTemperature"
                  :min-fraction-digits="1"
                  :max-fraction-digits="1"
                  placeholder="22.0"
              />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="optimalMin">Optimal Minimum (°C)</label>
              <pv-input-number
                  id="optimalMin"
                  v-model="formData.optimalTemperatureMin"
                  :min-fraction-digits="1"
                  :max-fraction-digits="1"
                  :class="{'p-invalid': errors.optimalTemperature}"
                  placeholder="18.0"
              />
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="optimalMax">Optimal Maximum (°C)</label>
              <pv-input-number
                  id="optimalMax"
                  v-model="formData.optimalTemperatureMax"
                  :min-fraction-digits="1"
                  :max-fraction-digits="1"
                  :class="{'p-invalid': errors.optimalTemperature}"
                  placeholder="25.0"
              />
              <small v-if="errors.optimalTemperature" class="p-error">{{ errors.optimalTemperature }}</small>
            </div>
          </div>
        </div>
      </pv-field-set>

      <!-- Location Information -->
      <pv-field-set legend="Location Information">
        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="locationName">Location Name*</label>
              <pv-input-text
                  id="locationName"
                  v-model="formData.locationName"
                  :class="{'p-invalid': errors.locationName}"
                  placeholder="Enter location name"
              />
              <small v-if="errors.locationName" class="p-error">{{ errors.locationName }}</small>
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="locationAddress">Address*</label>
              <pv-input-text
                  id="locationAddress"
                  v-model="formData.locationAddress"
                  :class="{'p-invalid': errors.locationAddress}"
                  placeholder="Enter full address"
              />
              <small v-if="errors.locationAddress" class="p-error">{{ errors.locationAddress }}</small>
            </div>
          </div>
        </div>

        <!-- ✅ AGREGADO: Coordenadas opcionales -->
        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="locationLatitude">Latitude (Optional)</label>
              <pv-input-number
                  id="locationLatitude"
                  v-model="formData.locationLatitude"
                  :min-fraction-digits="6"
                  :max-fraction-digits="6"
                  placeholder="-12.046374"
              />
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="locationLongitude">Longitude (Optional)</label>
              <pv-input-number
                  id="locationLongitude"
                  v-model="formData.locationLongitude"
                  :min-fraction-digits="6"
                  :max-fraction-digits="6"
                  placeholder="-77.042793"
              />
            </div>
          </div>
        </div>
      </pv-field-set>

      <!-- Energy Information -->
      <pv-field-set legend="Energy Information">
        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="energyCurrent">Current Consumption</label>
              <pv-input-number
                  id="energyCurrent"
                  v-model="formData.energyConsumptionCurrent"
                  placeholder="0"
              />
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="energyUnit">Energy Unit</label>
              <select
                  id="energyUnit"
                  v-model="formData.energyConsumptionUnit"
                  class="custom-select"
              >
                <option value="watts">Watts</option>
                <option value="kw">Kilowatts</option>
                <option value="kwh">kWh</option>
              </select>
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="energyAverage">Average Consumption</label>
              <pv-input-number
                  id="energyAverage"
                  v-model="formData.energyConsumptionAverage"
                  placeholder="0"
              />
            </div>
          </div>
        </div>
      </pv-field-set>

      <!-- Additional Information -->
      <pv-field-set legend="Additional Information">
        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="technicalDetails">Technical Details</label>
              <pv-textarea
                  id="technicalDetails"
                  v-model="formData.technicalDetails"
                  rows="3"
                  auto-resize
                  placeholder="Enter technical specifications..."
              />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="notes">Notes</label>
              <pv-textarea
                  id="notes"
                  v-model="formData.notes"
                  rows="3"
                  auto-resize
                  placeholder="Enter additional notes..."
              />
            </div>
          </div>
        </div>
      </pv-field-set>
    </div>

    <div class="form-footer">
      <pv-button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="cancel"
          :disabled="submitting"
      />
      <pv-button
          :label="submitting ? 'Creating...' : (isEditMode ? 'Update Equipment' : 'Create Equipment')"
          icon="pi pi-check"
          class="p-button-success"
          @click="submitForm"
          :loading="submitting"
          :disabled="submitting"
      />
    </div>
  </div>
</template>

<style scoped>
.equipment-form {
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.form-col {
  flex: 1;
  min-width: 280px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #ddd;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}

.p-field {
  margin-bottom: 1.25rem;
}

.p-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.p-field small {
  margin-top: 0.25rem;
  display: block;
  color: #e74c3c;
  font-size: 0.85rem;
}

/* ← CUSTOM SELECT STYLING (SOLUCIÓN DEFINITIVA) */
.custom-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  background-color: white;
  font-size: 0.95rem;
  color: #495057;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-select:hover {
  border-color: #ced4da;
}

.custom-select:focus {
  border-color: #2196F3;
  outline: none;
  box-shadow: 0 0 0 0.25rem rgba(33, 150, 243, 0.15);
}

.custom-select.is-invalid {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.15);
}

.custom-select option {
  padding: 0.5rem;
  background-color: white;
  color: #495057;
}

/* Fieldset styling */
:deep(.p-fieldset) {
  margin-bottom: 1.5rem;
  border: 1px solid #dee2e6 !important;
  border-radius: 8px !important;
  background-color: white !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04) !important;
}

:deep(.p-fieldset-legend) {
  padding: 0.75rem 1.25rem !important;
  font-weight: 600 !important;
  color: #2196F3 !important;
  background-color: white !important;
  border: 1px solid #dee2e6 !important;
  border-radius: 6px !important;
  font-size: 1rem !important;
}

:deep(.p-fieldset-content) {
  padding: 1.5rem !important;
}

/* Input styling */
:deep(.p-inputtext),
:deep(.p-inputnumber-input),
:deep(.p-inputtextarea) {
  width: 100% !important;
  padding: 0.75rem 1rem !important;
  border: 2px solid #e9ecef !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
  background-color: white !important;
  font-size: 0.95rem !important;
  color: #495057 !important;
}

:deep(.p-inputtext:focus),
:deep(.p-inputnumber-input:focus),
:deep(.p-inputtextarea:focus) {
  border-color: #2196F3 !important;
  box-shadow: 0 0 0 0.25rem rgba(33, 150, 243, 0.15) !important;
  outline: none !important;
}

:deep(.p-inputtext:hover),
:deep(.p-inputnumber-input:hover),
:deep(.p-inputtextarea:hover) {
  border-color: #ced4da !important;
}

/* InputNumber specific styling */
:deep(.p-inputnumber) {
  width: 100% !important;
}

/* Invalid state styling */
:deep(.p-invalid) {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.15) !important;
}

/* Error styling */
:deep(.p-error) {
  color: #dc3545 !important;
  font-weight: 500 !important;
}

/* Message styling */
:deep(.p-message) {
  margin-bottom: 1.5rem !important;
  border-radius: 6px !important;
}

/* Button styling */
:deep(.p-button) {
  padding: 0.75rem 1.5rem !important;
  border-radius: 6px !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
  font-size: 0.95rem !important;
}

:deep(.p-button-text) {
  color: #6c757d !important;
  background-color: transparent !important;
  border: 2px solid transparent !important;
}

:deep(.p-button-text:hover) {
  background-color: #f8f9fa !important;
  color: #495057 !important;
  border-color: #dee2e6 !important;
}

:deep(.p-button-success) {
  background-color: #28a745 !important;
  border-color: #28a745 !important;
  color: white !important;
}

:deep(.p-button-success:hover) {
  background-color: #218838 !important;
  border-color: #1e7e34 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3) !important;
}

:deep(.p-button:disabled) {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .equipment-form {
    padding: 1rem;
  }

  .form-row {
    flex-direction: column !important;
  }

  .form-col {
    width: 100% !important;
    min-width: unset !important;
  }

  .form-footer {
    flex-direction: column !important;
    gap: 0.5rem !important;
  }

  :deep(.p-inputtextarea) {
    background-color: white !important;
    border: 2px solid #e9ecef !important;
    border-radius: 6px !important;
    padding: 0.75rem 1rem !important;
    width: 100% !important;
    font-size: 0.95rem !important;
    color: #495057 !important;
    transition: all 0.2s ease !important;
  }

  :deep(.p-inputtextarea:hover) {
    border-color: #ced4da !important;
  }

  :deep(.p-inputtextarea:focus) {
    border-color: #2196F3 !important;
    box-shadow: 0 0 0 0.25rem rgba(33, 150, 243, 0.15) !important;
    outline: none !important;
  }

  :deep(.p-inputtextarea::placeholder) {
    color: #adb5bd !important;
  }

  :deep(.p-button) {
    width: 100% !important;
    justify-content: center !important;
  }
}
</style>