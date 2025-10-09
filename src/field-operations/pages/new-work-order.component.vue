<script lang="ts">
import { useRouter } from 'vue-router';
import { EquipmentService } from '../../equipment/services/equipment.service';
import { WorkOrderService } from '../services/work-order.service';
import { ServiceRequestService } from '../../service/services/service-request.service';
export default {
  name: 'new-work-order',
  data() {
    return {
      currentStep: 1,
      router: useRouter(),
      formData: {
        serviceRequestId: null,
        title: '',
        description: '',
        issueDetails: '',
        equipmentId: '',
        serviceType: '',
        priority: 'medium',
        scheduledDate: null,
        timeSlot: '',
        serviceAddress: ''
      },
      equipments: [],
      serviceRequests: [],
      equipmentService: new EquipmentService(),
      workOrderService: new WorkOrderService(),
      serviceRequestService: new ServiceRequestService()
    };
  },
  computed: {
    timeSlots() {
      return [
        { id: 1, time: '08:00 - 10:00', available: true },
        { id: 2, time: '10:00 - 12:00', available: true },
        { id: 3, time: '12:00 - 14:00', available: false },
        { id: 4, time: '14:00 - 16:00', available: true },
        { id: 5, time: '16:00 - 18:00', available: true }
      ];
    },
      availableServiceRequests() {
      return this.serviceRequests;
    }
  },
  methods: {
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
        message: this.$t('workOrders.form.confirmMessage'),
        header: this.$t('workOrders.form.confirmSubmission'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.$t('common.yes'),
        rejectLabel: this.$t('common.no'),
        accept: async () => {
          try {
            const payload = {
              serviceRequestId: this.formData.serviceRequestId || null,
              title: this.formData.title,
              description: this.formData.description,
              issueDetails: this.formData.issueDetails,
              equipmentId: parseInt(this.formData.equipmentId),
              serviceType: this.formData.serviceType,
              priority: this.formData.priority,
              scheduledDate: this.formData.scheduledDate ? new Date(this.formData.scheduledDate).toISOString() : null,
              timeSlot: this.formData.timeSlot,
              serviceAddress: this.formData.serviceAddress
            };

            const response = await this.workOrderService.createWorkOrder(payload);
            console.log('Work Order created:', response);

            this.$toast.add({
              severity: 'success',
              summary: this.$t('workOrders.form.success'),
              detail: this.$t('workOrders.form.successMessage'),
              life: 3000
            });

            this.router.push('/work-orders');
          } catch (error) {
            console.error('Error submitting:', error);

            let errorMessage = this.$t('workOrders.form.errorMessageGeneric');
            if (error.response && error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message;
            }

            this.$toast.add({
              severity: 'error',
              summary: this.$t('common.submissionFailed'),
              detail: errorMessage,
              life: 3000
            });
          }
        },
        reject: () => {
          this.$toast.add({
            severity: 'info',
            summary: this.$t('common.cancelled'),
            detail: this.$t('workOrders.form.cancelledMessage'),
            life: 2000
          });
        }
      });
    },
    getServiceRequestSummary(sr) {
      return `SR #${sr.orderNumber} - ${sr.description.substring(0, 50)}${sr.description.length > 50 ? '...' : ''} (${this.$t(`service.status.${sr.status}`)})`;
    }
  },
  created() {
    this.equipmentService.getAll()
        .then(response => {
          this.equipments = this.equipmentService.mapEquipment(response.data);
        })
        .catch(error => {
          console.error('Error loading equipment:', error);
          this.$toast.add({
            severity: 'error',
            summary: this.$t('common.error'),
            detail: this.$t('common.errorMessageLoadingEquipment'),
            life: 3000
          });
        });

    this.serviceRequestService.getAll()
        .then(response => {
          this.serviceRequests = this.serviceRequestService.mapServiceRequests(response.data)
              .filter(sr => sr.status === 'pending' || sr.status === 'accepted');
        })
        .catch(error => {
          console.error('Error loading service requests:', error);
          this.$toast.add({
            severity: 'error',
            summary: this.$t('common.error'),
            detail: this.$t('common.errorMessageLoadingServiceRequests'),
            life: 3000
          });
        });
  }
}
</script>

<template>
  <div class="container">
    <RouterLink to="/work-orders" class="link-back">
      {{ $t('workOrders.backToWorkOrders') }}
    </RouterLink>

    <h1 class="title">{{ $t('workOrders.newWorkOrder') }}</h1>
    <div class="step-indicator mb-8">
      <div
          v-for="(step, index) in [$t('workOrders.steps.details'), $t('workOrders.steps.equipmentScheduling'), $t('workOrders.steps.confirmation')]"
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

    <div v-if="currentStep === 1" class="card">
      <div>
        <label>{{ $t('workOrders.form.linkToServiceRequest') }}</label>
        <select v-model="formData.serviceRequestId" class="input">
          <option :value="null">{{ $t('workOrders.form.createIndependentWorkOrder') }}</option>
          <option v-for="sr in availableServiceRequests" :key="sr.id" :value="sr.id">
            {{ getServiceRequestSummary(sr) }}
          </option>
        </select>
      </div>

      <div>
        <label>{{ $t('workOrders.form.title') }}</label>
        <input type="text" v-model="formData.title" class="input" />
      </div>

      <div>
        <label>{{ $t('workOrders.form.description') }}</label>
        <textarea v-model="formData.description" class="input" rows="3"></textarea>
      </div>

      <div>
        <label>{{ $t('workOrders.form.issueDetails') }}</label>
        <textarea v-model="formData.issueDetails" class="input" rows="3"></textarea>
      </div>

      <div class="flex justify-end">
        <button class="btn" @click="handleNext" :disabled="!formData.title || !formData.description || !formData.issueDetails">
          {{ $t('common.continue') }}
        </button>
      </div>
    </div>

    <div v-if="currentStep === 2" class="card">
      <div>
        <label>{{ $t('workOrders.form.selectEquipment') }}</label>
        <select v-model="formData.equipmentId" class="input">
          <option disabled value="">{{ $t('workOrders.form.selectEquipmentPlaceholder') }}</option>
          <option v-for="e in equipments" :key="e.id" :value="e.id.toString()">
            {{ e.name }} - {{ e.location?.name || $t('common.notSpecified') }}
          </option>
        </select>
      </div>

      <div v-if="formData.equipmentId" class="info-box">
        <div
            v-for="e in equipments.filter(e => e.id.toString() === formData.equipmentId)"
            :key="e.id"
            class="grid grid-cols-2 gap-2"
        >
          <div><strong>{{ $t('equipment.name') }}:</strong> {{ e.name }}</div>
          <div><strong>{{ $t('common.location') }}:</strong> {{ e.location?.name || $t('common.notSpecified') }}</div>
          <div><strong>{{ $t('equipment.type') }}:</strong> {{ $t(`equipment.types.${e.type}`) }}</div>
          <div><strong>{{ $t('equipment.status') }}:</strong> {{ $t(`equipment.status.${e.getTemperatureStatus()}`) }}</div>
        </div>
      </div>

      <div>
        <label>{{ $t('workOrders.form.serviceType') }}</label>
        <select v-model="formData.serviceType" class="input">
          <option disabled value="">{{ $t('workOrders.form.selectServiceType') }}</option>
          <option value="preventive">{{ $t('service.form.preventive') }}</option>
          <option value="repair">{{ $t('service.form.repair') }}</option>
          <option value="installation">{{ $t('service.form.installation') }}</option>
          <option value="diagnostic">{{ $t('service.form.diagnostic') }}</option>
        </select>
      </div>

      <div>
        <label>{{ $t('workOrders.form.priority') }}</label>
        <div class="radio-group">
          <label><input type="radio" value="low" v-model="formData.priority" /> {{ $t('workOrders.form.low') }}</label>
          <label><input type="radio" value="medium" v-model="formData.priority" /> {{ $t('workOrders.form.medium') }}</label>
          <label><input type="radio" value="high" v-model="formData.priority" /> {{ $t('workOrders.form.high') }}</label>
          <label><input type="radio" value="critical" v-model="formData.priority" /> {{ $t('workOrders.form.critical') }}</label>
        </div>
      </div>

      <div>
        <label>{{ $t('workOrders.form.scheduledDate') }}</label>
        <input type="date" v-model="formData.scheduledDate" class="input" />

        <label>{{ $t('workOrders.form.availableTimeSlot') }}</label>
        <select v-model="formData.timeSlot" class="input">
          <option disabled value="">{{ $t('workOrders.form.selectTimeSlot') }}</option>
          <option v-for="slot in timeSlots.filter(s => s.available)" :key="slot.id" :value="slot.time">
            {{ slot.time }}
          </option>
        </select>
      </div>

      <div class="actions">
        <button class="btn-outline" @click="handleBack">{{ $t('common.back') }}</button>
        <button
            class="btn"
            @click="handleNext"
            :disabled="!formData.equipmentId || !formData.serviceType || !formData.priority || !formData.scheduledDate || !formData.timeSlot"
        >
          {{ $t('common.continue') }}
        </button>
      </div>
    </div>

    <div v-if="currentStep === 3" class="card">
      <label>{{ $t('workOrders.form.serviceAddress') }}</label>
      <textarea
          v-model="formData.serviceAddress"
          class="input"
          rows="3"
          :placeholder="$t('workOrders.form.serviceAddressPlaceholder')"
      ></textarea>

      <div class="info-box">
        <h2 class="text-primary font-semibold mb-2">{{ $t('workOrders.form.workOrderSummary') }}</h2>
        <ul class="space-y-1 text-gray-700 text-sm">
          <li v-if="formData.serviceRequestId"><strong>{{ $t('service.serviceRequest') }}:</strong> {{ getServiceRequestSummary(serviceRequests.find(sr => sr.id === formData.serviceRequestId)) || '-' }}</li>
          <li><strong>{{ $t('workOrders.title') }}:</strong> {{ formData.title }}</li>
          <li><strong>{{ $t('workOrders.description') }}:</strong> {{ formData.description }}</li>
          <li><strong>{{ $t('workOrders.issueDetails') }}:</strong> {{ formData.issueDetails }}</li>
          <li><strong>{{ $t('equipment.equipment') }}:</strong> {{ equipments.find(e => e.id.toString() === formData.equipmentId)?.name || '-' }}</li>
          <li><strong>{{ $t('workOrders.serviceType') }}:</strong> {{ $t(`service.form.${formData.serviceType}`) }}</li>
          <li><strong>{{ $t('workOrders.priority') }}:</strong> {{ $t(`workOrders.form.${formData.priority}`) }}</li>
          <li><strong>{{ $t('workOrders.scheduledFor') }}:</strong> {{ formData.scheduledDate }}</li>
          <li><strong>{{ $t('workOrders.timeSlot') }}:</strong> {{ formData.timeSlot }}</li>
          <li v-if="formData.serviceAddress"><strong>{{ $t('common.address') }}:</strong> {{ formData.serviceAddress }}</li>
        </ul>
      </div>

      <div class="actions">
        <button class="btn-outline" @click="handleBack">{{ $t('common.back') }}</button>
        <button class="btn" @click="handleSubmit">{{ $t('workOrders.form.sendWorkOrder') }}</button>
      </div>
    </div>
  </div>
  <pv-confirm-dialog
      :pt="{
     root: { class: 'custom-confirm-dialog' },
     header: { class: 'custom-confirm-header' },
    message: { class: 'custom-confirm-message' },
    icon: { class: 'custom-confirm-icon' },
    footer: { class: 'custom-confirm-footer' }
  }"
  />
  <pv-toast />
</template>

<style scoped>
.container {
  max-width: 768px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background-color: #f0f9ff;
  min-height: 100vh;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #055f84;
  margin-bottom: 1.5rem;
}

.link-back {
  display: inline-block;
  color: #0884c4;
  margin-bottom: 1rem;
  font-weight: 500;
}

.card {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: box-shadow 0.3s, border-color 0.3s;
}

.input:focus {
  border-color: #0884c4;
  box-shadow: 0 0 0 3px rgba(8, 132, 196, 0.25);
  outline: none;
}

.radio-group {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  color: #374151;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: #374151;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.btn {
  background-color: #0884c4;
  color: white;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover:not(:disabled) {
  background-color: #056a9d;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #0884c4;
  color: #0884c4;
  padding: 0.5rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-outline:hover {
  background-color: #e0f3fb;
}

.info-box {
  background-color: #e6f6fd;
  padding: 1rem;
  border-radius: 0.75rem;
}

.step-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  margin-bottom: 2rem;
  position: relative;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  text-align: center;
  z-index: 1;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 35px;
  right: -50%;
  width: 100%;
  height: 2px;
  background-color: #d1d5db;
  z-index: 0;
}

.step.completed:not(:last-child)::after {
  background-color: #0884c4;
}

.circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #d1d5db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.25rem;
  transition: background-color 0.3s;
}

.step.active .circle {
  background-color: #0884c4;
}

.step.completed .circle {
  background-color: #0884c4;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}
</style>