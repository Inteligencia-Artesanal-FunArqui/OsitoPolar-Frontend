<script>
import { EquipmentService } from '../../equipment/services/equipment.service';
import { WorkOrderService } from '../services/work-order.service';
import { ServiceRequestService } from '../../service/services/service-request.service';
export default {
  name: 'new-work-order',
  data() {
    return {
      currentStep: 1,
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
    // work order service types come from the work-order backend enum (different from service requests)
    serviceTypes() {
      return ['Maintenance', 'Repair', 'Installation', 'Inspection', 'Emergency'];
    },
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
  watch: {
    // linking a service request pre-fills the wizard (the user can still edit everything)
    'formData.serviceRequestId'(id) {
      const sr = this.serviceRequests.find(r => String(r.id) === String(id));
      if (!sr) return;
      const typeMap = { PreventiveMaintenance: 'Maintenance', CorrectiveMaintenance: 'Repair', Installation: 'Installation', Diagnostic: 'Inspection' };
      Object.assign(this.formData, {
        title: sr.title || this.formData.title,
        description: sr.description || this.formData.description,
        issueDetails: sr.issueDetails || sr.description || this.formData.issueDetails,
        equipmentId: sr.equipmentId ? String(sr.equipmentId) : this.formData.equipmentId,
        serviceType: typeMap[sr.serviceType] || this.formData.serviceType,
        priority: String(sr.priority || 'medium').toLowerCase(),
        serviceAddress: sr.serviceAddress || this.formData.serviceAddress
      });
    }
  },
  methods: {
    typeLabel(type) {
      const key = `equipment.types.${String(type || '').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()}`;
      return this.$te(key) ? this.$t(key) : (type || '-');
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

            await this.workOrderService.createWorkOrder(payload);

            this.$toast.add({
              severity: 'success',
              summary: this.$t('workOrders.form.success'),
              detail: this.$t('workOrders.form.successMessage'),
              life: 3000
            });

            this.$router.push('/work-orders');
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
      if (!sr) return '';
      const text = sr.description || sr.title || '';
      return `${sr.orderNumber || `#${sr.id}`} - ${text.substring(0, 50)}${text.length > 50 ? '...' : ''} (${this.$t(`badge.requestStatus.${sr.status}`)})`;
    }
  },
  created() {
    this.equipmentService.getAllEquipments()
        .then(equipments => {
          // service already returns Equipment instances (no axios wrapper)
          this.equipments = equipments;
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
  <div class="op-wizard">
    <op-page-header
        :title="$t('workOrders.newWorkOrder')"
        :subtitle="$t('workOrders.form.subtitle')"
        back-to="/work-orders"
        :back-label="$t('workOrders.backToWorkOrders')" />
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
          <option v-for="e in equipments" :key="e.id" :value="String(e.id)">
            {{ e.name }} - {{ e.location?.name || $t('common.notSpecified') }}
          </option>
        </select>
      </div>

      <div v-if="formData.equipmentId" class="info-box">
        <div
            v-for="e in equipments.filter(e => String(e.id) === String(formData.equipmentId))"
            :key="e.id"
            class="info-grid"
        >
          <div><strong>{{ $t('equipment.name') }}:</strong> {{ e.name }}</div>
          <div><strong>{{ $t('common.location') }}:</strong> {{ e.location?.name || $t('common.notSpecified') }}</div>
          <div><strong>{{ $t('equipment.type') }}:</strong> {{ typeLabel(e.type) }}</div>
          <div><strong>{{ $t('equipment.statusLabel') }}:</strong> <op-status-badge kind="temperature" :value="e.getTemperatureStatus()" /></div>
        </div>
      </div>

      <div>
        <label>{{ $t('workOrders.form.serviceType') }}</label>
        <select v-model="formData.serviceType" class="input">
          <option disabled value="">{{ $t('workOrders.form.selectServiceType') }}</option>
          <option v-for="type in serviceTypes" :key="type" :value="type">{{ $t(`badge.serviceType.${type.toLowerCase()}`) }}</option>
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
          <li v-if="formData.serviceRequestId"><strong>{{ $t('service.serviceRequest') }}:</strong> {{ getServiceRequestSummary(serviceRequests.find(sr => String(sr.id) === String(formData.serviceRequestId))) || '-' }}</li>
          <li><strong>{{ $t('workOrders.titleLabel') }}:</strong> {{ formData.title }}</li>
          <li><strong>{{ $t('workOrders.description') }}:</strong> {{ formData.description }}</li>
          <li><strong>{{ $t('workOrders.issueDetails') }}:</strong> {{ formData.issueDetails }}</li>
          <li><strong>{{ $t('equipment.equipment') }}:</strong> {{ equipments.find(e => String(e.id) === String(formData.equipmentId))?.name || '-' }}</li>
          <li><strong>{{ $t('workOrders.serviceType') }}:</strong> {{ formData.serviceType ? $t(`badge.serviceType.${formData.serviceType.toLowerCase()}`) : '-' }}</li>
          <li><strong>{{ $t('workOrders.priority') }}:</strong> {{ $t(`badge.priority.${formData.priority}`) }}</li>
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
</template>
