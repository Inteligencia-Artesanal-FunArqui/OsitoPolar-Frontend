<script>
import service from '../services/technician-portal.service.js';
import { formatDateTime } from '../../shared/format.js';

const CLOSED = ['completed', 'resolved', 'cancelled'];

/** @component TechnicianOrderDetailPage - one work order: checklist, notes and the start / hold / finish buttons. */
export default {
  name: 'TechnicianOrderDetailPage',
  data() { return { order: null, notes: '', resolution: '', loading: true, failed: false, saving: false }; },
  computed: {
    closed() { return CLOSED.includes(this.order?.status); },
    active() { return this.order?.status === 'in_progress'; },
    progress() { const l = this.order?.checklist || []; return { done: l.filter(i => i.done).length, total: l.length }; },
    when() { return this.order?.scheduledDate ? formatDateTime(this.order.scheduledDate, this.$i18n.locale) : this.$t('technician.common.noDate'); },
    completedOn() { return this.order?.actualCompletionDate ? formatDateTime(this.order.actualCompletionDate, this.$i18n.locale) : ''; }
  },
  mounted() { this.load(); },
  methods: {
    async load() {
      this.loading = true; this.failed = false;
      try {
        this.order = await service.getWorkOrder(this.$route.params.id);
        this.notes = this.order?.technicianNotes || '';
        this.resolution = this.order?.resolutionDetails || '';
      } catch { this.failed = true; } finally { this.loading = false; }
    },
    /** One place for every PATCH so errors and toasts behave the same. */
    async update(payload, doneKey) {
      if (this.saving) return;
      this.saving = true;
      try {
        this.order = await service.updateWorkOrder(this.order.id, payload);
        if (doneKey) this.$toast.add({ severity: 'success', summary: this.$t(doneKey), life: 2500 });
      } catch (error) {
        this.$toast.add({ severity: 'error', summary: this.$t('technician.detail.updateFailed'), detail: error.response?.data?.message || error.message, life: 5000 });
        await this.load(); // re-sync with the server version so the screen never lies
      } finally { this.saving = false; }
    },
    toggle(item) { return this.update({ checklist: [{ id: item.id, done: !item.done }] }); },
    saveNotes() { return this.update({ technicianNotes: this.notes }, 'technician.detail.notesSaved'); },
    start() { return this.update({ status: 'in_progress' }, 'technician.detail.started'); },
    resume() { return this.update({ status: 'in_progress' }, 'technician.detail.resumed'); },
    hold() { return this.update({ technicianNotes: this.notes, status: 'on_hold' }, 'technician.detail.onHold'); },
    finish() { return this.update({ technicianNotes: this.notes, resolutionDetails: this.resolution, status: 'completed' }, 'technician.detail.finished'); }
  }
};
</script>

<template>
  <div>
    <router-link :to="{ name: 'technician-orders' }" class="tp-back"><i class="pi pi-arrow-left" aria-hidden="true"></i>{{ $t('technician.nav.orders') }}</router-link>

    <op-loading-state v-if="loading" :label="$t('technician.common.loading')" />
    <op-error-state v-else-if="failed" :title="$t('technician.common.errorTitle')" :message="$t('technician.common.errorMessage')" @retry="load" />
    <op-empty-state v-else-if="!order" icon="pi pi-search" :title="$t('technician.detail.title')" :message="$t('technician.detail.notFound')" />

    <template v-else>
      <div class="tp-card head">
        <div class="tp-row"><span class="num">{{ order.workOrderNumber }}</span><op-status-badge kind="workOrderStatus" :value="order.status" /></div>
        <h1>{{ order.title }}</h1>
        <div class="tp-meta">
          <span><i class="pi pi-box" aria-hidden="true"></i>{{ order.equipment?.name }}</span>
          <span><i class="pi pi-map-marker" aria-hidden="true"></i>{{ order.serviceAddress }}</span>
          <span><i class="pi pi-calendar" aria-hidden="true"></i>{{ when }}</span>
          <span v-if="order.timeSlot"><i class="pi pi-clock" aria-hidden="true"></i>{{ order.timeSlot }}</span>
        </div>
        <div class="tp-row"><op-status-badge kind="priority" :value="order.priority" /><op-status-badge kind="serviceType" :value="order.serviceType" /></div>
      </div>

      <h2 class="tp-section-title">{{ $t('technician.detail.issue') }}</h2>
      <div class="tp-card text">{{ order.issueDetails }}</div>
      <h2 class="tp-section-title">{{ $t('technician.detail.description') }}</h2>
      <div class="tp-card text">{{ order.description }}</div>

      <h2 class="tp-section-title">{{ $t('technician.detail.checklist') }} <span class="count">{{ $t('technician.detail.checklistProgress', progress) }}</span></h2>
      <ul class="tp-card checklist">
        <li v-for="item in order.checklist" :key="item.id">
          <label :class="{ done: item.done }">
            <input type="checkbox" :checked="item.done" :disabled="closed || saving" @change="toggle(item)" />
            <span>{{ item.label }}</span>
          </label>
        </li>
      </ul>

      <h2 class="tp-section-title">{{ $t('technician.detail.notes') }}</h2>
      <div class="tp-card tp-stack">
        <pv-textarea v-model="notes" rows="4" auto-resize class="w-full" :disabled="closed" :placeholder="$t('technician.detail.notesPlaceholder')" :aria-label="$t('technician.detail.notes')" />
        <pv-button v-if="!closed" :label="$t('technician.detail.saveNotes')" icon="pi pi-save" severity="secondary" outlined class="tp-btn-block" :disabled="saving" @click="saveNotes" />
      </div>

      <template v-if="active">
        <h2 class="tp-section-title">{{ $t('technician.detail.resolution') }}</h2>
        <pv-textarea v-model="resolution" rows="3" auto-resize class="w-full" :placeholder="$t('technician.detail.resolutionPlaceholder')" :aria-label="$t('technician.detail.resolution')" />
      </template>
      <div v-else-if="closed && order.resolutionDetails">
        <h2 class="tp-section-title">{{ $t('technician.detail.resolution') }}</h2>
        <div class="tp-card text">{{ order.resolutionDetails }}</div>
      </div>

      <div class="actions">
        <pv-button v-if="order.status === 'assigned'" :label="$t('technician.detail.start')" icon="pi pi-play" class="tp-btn-block" :loading="saving" @click="start" />
        <pv-button v-if="order.status === 'on_hold'" :label="$t('technician.detail.resume')" icon="pi pi-play" class="tp-btn-block" :loading="saving" @click="resume" />
        <template v-if="active">
          <pv-button :label="$t('technician.detail.finish')" icon="pi pi-check" severity="success" class="tp-btn-block" :loading="saving" :disabled="progress.done < progress.total" @click="finish" />
          <pv-button :label="$t('technician.detail.hold')" icon="pi pi-pause" severity="warn" outlined class="tp-btn-block" :disabled="saving" @click="hold" />
        </template>
        <p v-if="closed" class="closed"><i class="pi pi-lock" aria-hidden="true"></i> {{ $t('technician.detail.closedInfo') }} <span v-if="completedOn">{{ $t('technician.detail.completedOn') }} {{ completedOn }}.</span></p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.head { display: flex; flex-direction: column; gap: var(--op-space-3); border-top: 5px solid var(--tp-accent); }
.head h1 { font-size: 1.35rem; color: var(--op-text-strong); line-height: 1.25; }
.num { font-size: 0.8rem; font-weight: 700; color: var(--op-text-muted); letter-spacing: 0.04em; }
.text { white-space: pre-line; color: var(--op-text); }
.count { margin-left: var(--op-space-2); text-transform: none; letter-spacing: 0; color: var(--op-brand-strong); }
.checklist { list-style: none; padding: 0; overflow: hidden; }
.checklist li + li { border-top: 1px solid var(--op-border); }
.checklist label { display: flex; align-items: center; gap: var(--op-space-3); min-height: 56px; padding: 0 var(--op-space-4); cursor: pointer; }
.checklist input { width: 24px; height: 24px; accent-color: var(--op-success); flex: 0 0 auto; }
.checklist label.done span { color: var(--op-text-muted); text-decoration: line-through; }
.actions { display: flex; flex-direction: column; gap: var(--op-space-3); margin-top: var(--op-space-5); }
.closed { color: var(--op-text-muted); text-align: center; }
</style>
