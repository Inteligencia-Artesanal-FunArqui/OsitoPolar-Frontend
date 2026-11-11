<script>
/**
 * @component TechnicianFormDialog
 * @description Create / edit dialog for a technician (PrimeVue Dialog + native-validated form).
 * Emits `saved` with the API row so the page can refresh without another round trip.
 */
import { TechnicianService } from '../services/technician.service.js';
import { validateTechnician } from '../technician-validation.js';

const EMPTY = () => ({ name: '', email: '', phone: '', specialization: '', availability: 'Available' });

export default {
  name: 'TechnicianFormDialog',
  props: {
    visible: Boolean,
    /** null = create; a Technician = edit */
    technician: { type: Object, default: null }
  },
  emits: ['update:visible', 'saved'],
  data() {
    return { form: EMPTY(), errors: {}, submitted: false, saving: false, service: new TechnicianService() };
  },
  computed: {
    isEdit() { return !!this.technician; },
    availabilityOptions() {
      return ['Available', 'Occupied', 'On Leave'].map(value => ({ value, label: this.$t(`technicians.availabilityOptions.${value.toLowerCase().replace(' ', '_')}`) }));
    }
  },
  watch: {
    visible(open) {
      if (!open) return;
      this.submitted = false; this.errors = {};
      this.form = this.technician
        ? { name: this.technician.name, email: this.technician.email, phone: this.technician.phone, specialization: this.technician.specialization, availability: this.availabilityFrom(this.technician.availability) }
        : EMPTY();
    }
  },
  methods: {
    availabilityFrom(value) {
      const v = String(value || '').toLowerCase();
      return v === 'occupied' || v === 'busy' ? 'Occupied' : v === 'on leave' ? 'On Leave' : 'Available';
    },
    errorText(field) { return this.errors[field] ? this.$t(`technicians.form.errors.${this.errors[field]}`) : ''; },
    revalidate() { if (this.submitted) this.errors = validateTechnician(this.form).errors; },
    async submit() {
      this.submitted = true;
      const { valid, errors, payload } = validateTechnician(this.form);
      this.errors = errors;
      if (!valid) return;
      this.saving = true;
      try {
        const response = this.isEdit
          ? await this.service.updateTechnician(this.technician.id, payload)
          : await this.service.createTechnician(payload);
        this.$toast.add({
          severity: 'success',
          summary: this.$t(this.isEdit ? 'technicians.updatedTitle' : 'technicians.createdTitle'),
          detail: this.$t(this.isEdit ? 'technicians.updatedDetail' : 'technicians.createdDetail', { name: payload.name }),
          life: 3500
        });
        this.$emit('saved', response.data);
        this.$emit('update:visible', false);
      } catch (error) {
        // 409 (duplicate email) and 400 messages come from the API; fall back to a generic text
        this.$toast.add({ severity: 'error', summary: this.$t('common.error'), detail: error.response?.data?.message || this.$t('technicians.saveError'), life: 5000 });
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<template>
  <pv-dialog
      :visible="visible" modal :draggable="false" :closable="!saving"
      :header="$t(isEdit ? 'technicians.form.editTitle' : 'technicians.form.createTitle')"
      :style="{ width: 'min(520px, 94vw)' }"
      @update:visible="$emit('update:visible', $event)">
    <form class="tech-form" novalidate @submit.prevent="submit">
      <div class="tech-form__field">
        <label for="tech-name">{{ $t('technicians.form.name') }} *</label>
        <pv-input-text id="tech-name" v-model="form.name" :placeholder="$t('technicians.form.namePlaceholder')" :invalid="!!errors.name" autocomplete="off" @input="revalidate" />
        <small v-if="errors.name" class="tech-form__error" role="alert">{{ errorText('name') }}</small>
      </div>
      <div class="tech-form__field">
        <label for="tech-email">{{ $t('technicians.form.email') }} *</label>
        <pv-input-text id="tech-email" v-model="form.email" type="email" :placeholder="$t('technicians.form.emailPlaceholder')" :invalid="!!errors.email" autocomplete="off" @input="revalidate" />
        <small v-if="errors.email" class="tech-form__error" role="alert">{{ errorText('email') }}</small>
      </div>
      <div class="tech-form__row">
        <div class="tech-form__field">
          <label for="tech-phone">{{ $t('technicians.form.phone') }}</label>
          <pv-input-text id="tech-phone" v-model="form.phone" type="tel" :placeholder="$t('technicians.form.phonePlaceholder')" :invalid="!!errors.phone" autocomplete="off" @input="revalidate" />
          <small v-if="errors.phone" class="tech-form__error" role="alert">{{ errorText('phone') }}</small>
        </div>
        <div class="tech-form__field">
          <label for="tech-availability">{{ $t('technicians.form.availability') }}</label>
          <pv-dropdown id="tech-availability" v-model="form.availability" :options="availabilityOptions" option-label="label" option-value="value" />
        </div>
      </div>
      <div class="tech-form__field">
        <label for="tech-spec">{{ $t('technicians.form.specialization') }} *</label>
        <pv-input-text id="tech-spec" v-model="form.specialization" :placeholder="$t('technicians.form.specializationPlaceholder')" :invalid="!!errors.specialization" autocomplete="off" @input="revalidate" />
        <small v-if="errors.specialization" class="tech-form__error" role="alert">{{ errorText('specialization') }}</small>
      </div>
      <footer class="tech-form__actions">
        <pv-button type="button" :label="$t('common.cancel')" severity="secondary" text :disabled="saving" @click="$emit('update:visible', false)" />
        <pv-button type="submit" :label="$t(saving ? 'technicians.form.saving' : (isEdit ? 'technicians.form.save' : 'technicians.form.create'))" icon="pi pi-check" :loading="saving" />
      </footer>
    </form>
  </pv-dialog>
</template>

<style scoped>
.tech-form { display: flex; flex-direction: column; gap: var(--op-space-4); }
.tech-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--op-space-4); }
.tech-form__field { display: flex; flex-direction: column; gap: var(--op-space-2); min-width: 0; }
.tech-form__field label { font-weight: 600; font-size: 0.9rem; color: var(--op-text-strong); }
.tech-form__error { color: var(--op-danger, #c0392b); }
.tech-form__actions { display: flex; justify-content: flex-end; gap: var(--op-space-3); margin-top: var(--op-space-2); }
@media (max-width: 520px) { .tech-form__row { grid-template-columns: 1fr; } }
</style>
