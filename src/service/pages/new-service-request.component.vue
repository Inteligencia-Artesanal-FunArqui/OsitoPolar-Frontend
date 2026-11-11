<script>
import { EquipmentService } from '../../equipment/services/equipment.service';
import { ServiceRequestService } from '../services/service-request.service';

export default {
  name: 'new-service-request',
  data() {
    return {
      currentStep: 1,
      formData: {
        equipmentId: '',
        serviceType: '',
        description: '',
        priority: 'medium',
        urgency: 'normal',
        date: null,
        timeSlot: '',
        asap: false,
        serviceAddress: ''
      },
      equipments: [],
      equipmentService: new EquipmentService(),
      serviceRequestService: new ServiceRequestService()
    };
  },
  computed: {
    serviceTypeLabel() {
      return this.$t(`badge.serviceType.${{ preventive: 'preventive_maintenance', corrective: 'corrective_maintenance' }[this.formData.serviceType] || this.formData.serviceType}`);
    },
    timeSlots() {
      return [
        { id: 1, time: '08:00 - 10:00', available: true },
        { id: 2, time: '10:00 - 12:00', available: true },
        { id: 3, time: '12:00 - 14:00', available: false },
        { id: 4, time: '14:00 - 16:00', available: true },
        { id: 5, time: '16:00 - 18:00', available: true }
      ];
    }
  },
  methods: {
    typeLabel(type) {
      const key = `equipment.types.${String(type || '').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()}`;
      return this.$te(key) ? this.$t(key) : (type || '-');
    },
    // Convert frontend values to C# enum string names
    getServiceTypeString(serviceType) {
      const mapping = {
        'preventive': 'PreventiveMaintenance',
        'corrective': 'CorrectiveMaintenance',
        'installation': 'Installation',
        'diagnostic': 'Diagnostic'
      };
      return mapping[serviceType] || 'Diagnostic';
    },
    getUrgencyString(urgency) {
      const mapping = {
        'normal': 'Normal',
        'urgent': 'Urgent',
        'emergency': 'Emergency'
      };
      return mapping[urgency] || 'Normal';
    },
    getPriorityString(priority) {
      const mapping = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High',
        'critical': 'Critical'
      };
      return mapping[priority] || 'Medium';
    },
    handleNext() {
      if (this.currentStep < 3) {
        this.currentStep++;
        window.scrollTo(0, 0);
      }
    },
    handleBack() {
      if (this.currentStep > 1) {
        this.currentStep--;
        window.scrollTo(0, 0);
      }
    },
    async handleSubmit() {
      this.$confirm.require({
        message: this.$t('service.form.confirmMessage'),
        header: this.$t('service.form.confirmSubmission'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.$t('service.yes'),
        rejectLabel: this.$t('service.no'),
        accept: async () => {
          try {

            const payload = {
              title: `${this.serviceTypeLabel} - ${this.formData.description.substring(0, 40)}`,
              description: this.formData.description,
              issueDetails: this.formData.description,
              clientId: 1,
              companyId: 1,
              equipmentId: parseInt(this.formData.equipmentId),
              serviceType: this.getServiceTypeString(this.formData.serviceType),
              reportedByUserId: 1,
              priority: this.getPriorityString(this.formData.priority),
              urgency: this.getUrgencyString(this.formData.urgency),
              isEmergency: this.formData.asap,
              scheduledDate: this.formData.date ? new Date(this.formData.date).toISOString() : null,
              timeSlot: this.formData.timeSlot || '',
              serviceAddress: this.formData.serviceAddress || ''
            };

            const response = await this.serviceRequestService.createRequest(payload);

            this.$toast.add({
              severity: 'success',
              summary: this.$t('service.form.success'),
              detail: this.$t('service.form.successMessage'),
              life: 3000
            });

            this.$router.push('/service-requests');
          } catch (error) {
            console.error('Error submitting:', error);

            if (error.response) {
                            
              if (error.response.data.errors) {
                console.error('🔍 Validation Errors:', JSON.stringify(error.response.data.errors, null, 2));

                // Display specific validation errors to user
                const errors = error.response.data.errors;
                let errorMessage = this.$t('service.form.validationErrors');

                Object.keys(errors).forEach(field => {
                  errors[field].forEach(message => {
                    errorMessage += `\n• ${message}`;
                  });
                });

                this.$toast.add({
                  severity: 'error',
                  summary: this.$t('service.form.validationTitle'),
                  detail: errorMessage,
                  life: 5000
                });
              } else {
                this.$toast.add({
                  severity: 'error',
                  summary: this.$t('common.submissionFailed'),
                  detail: error.response.data.message || error.response.data.detail || this.$t('service.form.errorMessage'),
                  life: 3000
                });
              }

                          } else {
              // Network or other error
              this.$toast.add({
                severity: 'error',
                summary: this.$t('common.networkError'),
                detail: this.$t('common.networkErrorDetail'),
                life: 3000
              });
            }
          }
        },
        reject: () => {
          this.$toast.add({
            severity: 'info',
            summary: this.$t('service.form.cancelled'),
            detail: this.$t('service.form.cancelledMessage'),
            life: 2000
          });
        }
      });
    }
  },
  created() {
    this.equipmentService.getAllEquipments()
        .then(equipments => {
          this.equipments = equipments;
        })
        .catch(error => {
          console.error('Error loading equipment:', error);
          this.$toast.add({
            severity: 'error',
            summary: this.$t('service.error'),
            detail: this.$t('service.form.errorMessage'),
            life: 3000
          });
        });
  }
}
</script>



<template>
  <div class="op-wizard">
    <op-page-header
        :title="$t('service.newServiceRequest')"
        :subtitle="$t('service.form.subtitle')"
        back-to="/service-requests"
        :back-label="$t('service.backToRequests')" />
    <div class="step-indicator mb-8">
      <div
          v-for="(step, index) in [$t('service.steps.equipment'), $t('service.steps.scheduling'), $t('service.steps.confirmation')]"
          :key="index"
          class="step"
          :class="{
            active: currentStep === index + 1,
            completed: currentStep > index + 1,
          }"
      >
        <div class="circle">{{ index + 1 }}</div>
        <div class="label">{{ step }}</div>
      </div>
    </div>

    <!-- STEP 1: equipment and service details -->
    <div v-if="currentStep === 1" class="card">
      <div>
        <label>{{ $t('service.form.selectEquipment') }}</label>
        <select v-model="formData.equipmentId" class="input">
          <option disabled value="">{{ $t('service.form.selectEquipmentPlaceholder') }}</option>
          <option v-for="e in equipments" :key="e.id" :value="String(e.id)">
            {{ e.name }} - {{ e.location?.name || $t('service.notSpecified') }}
          </option>
        </select>
      </div>

      <!-- Equipment Info Box (solo si hay equipo seleccionado) -->
      <div v-if="formData.equipmentId" class="info-box">
        <div
            v-for="e in equipments.filter(e => String(e.id) === String(formData.equipmentId))"
            :key="e.id"
            class="info-grid"
        >
          <div><strong>{{ $t('equipment.name') }}:</strong> {{ e.name }}</div>
          <div><strong>{{ $t('service.location') }}:</strong> {{ e.location?.name || $t('service.notSpecified') }}</div>
          <div><strong>{{ $t('equipment.type') }}:</strong> {{ typeLabel(e.type) }}</div>
          <div><strong>{{ $t('equipment.statusLabel') }}:</strong> <op-status-badge kind="temperature" :value="e.getTemperatureStatus()" /></div>
        </div>
      </div>

      <div>
        <label>{{ $t('service.form.serviceType') }}</label>
        <select v-model="formData.serviceType" class="input">
          <option disabled value="">{{ $t('service.form.selectServiceType') }}</option>
          <option value="preventive">{{ $t('service.form.preventive') }}</option>
          <option value="corrective">{{ $t('service.form.corrective') }}</option>
          <option value="installation">{{ $t('service.form.installation') }}</option>
          <option value="diagnostic">{{ $t('service.form.diagnostic') }}</option>
        </select>
      </div>

      <!-- Description -->
      <div>
        <label>{{ $t('service.form.description') }}</label>
        <textarea v-model="formData.description" class="input" rows="3"></textarea>
      </div>

      <!-- Priority (EPriority) -->
      <div>
        <label>{{ $t('service.form.priority') }}</label>
        <div class="radio-group">
          <label><input type="radio" value="low" v-model="formData.priority" /> {{ $t('service.form.low') }}</label>
          <label><input type="radio" value="medium" v-model="formData.priority" /> {{ $t('service.form.medium') }}</label>
          <label><input type="radio" value="high" v-model="formData.priority" /> {{ $t('service.form.high') }}</label>
          <label><input type="radio" value="critical" v-model="formData.priority" /> {{ $t('service.form.critical') }}</label>
        </div>
      </div>

      <!-- Urgency (EUrgency) -->
      <div>
        <label>{{ $t('service.form.urgency') }}</label>
        <div class="radio-group">
          <label><input type="radio" value="normal" v-model="formData.urgency" /> {{ $t('service.form.normal') }}</label>
          <label><input type="radio" value="urgent" v-model="formData.urgency" /> {{ $t('service.form.urgent') }}</label>
          <label><input type="radio" value="emergency" v-model="formData.urgency" /> {{ $t('service.form.emergency') }}</label>
        </div>
      </div>

      <div class="flex justify-end">
        <button class="btn" @click="handleNext" :disabled="!formData.equipmentId || !formData.serviceType || !formData.description">
          {{ $t('service.form.continue') }}
        </button>
      </div>
    </div>

    <div v-if="currentStep === 2" class="card">
      <div>
        <label>{{ $t('service.form.asapQuestion') }}</label>
        <label class="checkbox">
          <input type="checkbox" v-model="formData.asap" />
          {{ $t('service.form.asapYes') }}
        </label>
      </div>

      <div v-if="!formData.asap">
        <label>{{ $t('service.form.desiredDate') }}</label>
        <input type="date" v-model="formData.date" class="input" />

        <label>{{ $t('service.form.availableTimeSlot') }}</label>
        <select v-model="formData.timeSlot" class="input">
          <option disabled value="">{{ $t('service.form.selectTimeSlot') }}</option>
          <option v-for="slot in timeSlots.filter(s => s.available)" :key="slot.id" :value="slot.time">
            {{ slot.time }}
          </option>
        </select>
      </div>

      <div class="actions">
        <button class="btn-outline" @click="handleBack">{{ $t('service.form.back') }}</button>
        <button
            class="btn"
            @click="handleNext"
            :disabled="!formData.asap && (!formData.date || !formData.timeSlot)"
        >
          {{ $t('service.form.continue') }}
        </button>
      </div>
    </div>

    <!-- STEP 3: confirmation -->
    <div v-if="currentStep === 3" class="card">
      <label>{{ $t('service.form.serviceAddress') }}</label>
      <textarea
          v-model="formData.serviceAddress"
          class="input"
          rows="3"
          :placeholder="$t('service.form.serviceAddressPlaceholder')"
      ></textarea>

      <div class="info-box">
        <h2 class="text-primary font-semibold mb-2">{{ $t('service.form.requestSummary') }}</h2>
        <ul class="space-y-1 text-gray-700 text-sm">
          <li><strong>{{ $t('service.equipment') }}:</strong> {{ equipments.find(e => String(e.id) === String(formData.equipmentId))?.name || '-' }}</li>
          <li><strong>{{ $t('service.serviceType') }}:</strong> {{ serviceTypeLabel }}</li>
          <li><strong>{{ $t('service.urgency') }}:</strong> {{ $t(`badge.urgency.${formData.urgency}`) }}</li>
          <li><strong>{{ $t('service.description') }}:</strong> {{ formData.description }}</li>
          <li><strong>{{ $t('service.form.immediateAttention') }}</strong> {{ formData.asap ? $t('service.yes') : $t('service.no') }}</li>
          <li v-if="!formData.asap"><strong>{{ $t('service.form.scheduledFor') }}</strong> {{ formData.date }}<br /><strong>{{ $t('service.timeSlot') }}:</strong> {{ formData.timeSlot }}</li>
          <li v-if="formData.serviceAddress"><strong>{{ $t('service.address') }}:</strong> {{ formData.serviceAddress }}</li>
        </ul>
      </div>

      <div class="actions">
        <button class="btn-outline" @click="handleBack">{{ $t('service.form.back') }}</button>
        <button class="btn" @click="handleSubmit">{{ $t('service.form.sendRequest') }}</button>
      </div>
    </div>
  </div>
</template>
