<script>
import { formatDateTime } from '../../shared/format.js';

/** @component TechnicianOrderCard - compact work order row used by "Mi jornada" and "Mis órdenes". */
export default {
  name: 'TechnicianOrderCard',
  props: { order: { type: Object, required: true } },
  computed: {
    when() { return this.order.scheduledDate ? formatDateTime(this.order.scheduledDate, this.$i18n.locale) : this.$t('technician.common.noDate'); },
    progress() {
      const list = this.order.checklist || [];
      return { done: list.filter(i => i.done).length, total: list.length };
    }
  }
};
</script>

<template>
  <router-link :to="{ name: 'technician-order-detail', params: { id: order.id } }" class="tp-order tp-card" :class="`tp-order--${order.status}`">
    <div class="tp-row">
      <span class="tp-order__number">{{ order.workOrderNumber }}</span>
      <op-status-badge kind="workOrderStatus" :value="order.status" />
    </div>
    <h3 class="tp-order__title">{{ order.title }}</h3>
    <div class="tp-meta">
      <span><i class="pi pi-box" aria-hidden="true"></i>{{ order.equipment?.name }}</span>
      <span><i class="pi pi-calendar" aria-hidden="true"></i>{{ when }}</span>
      <span v-if="order.timeSlot"><i class="pi pi-clock" aria-hidden="true"></i>{{ order.timeSlot }}</span>
    </div>
    <div class="tp-row">
      <op-status-badge kind="priority" :value="order.priority" />
      <span v-if="progress.total" class="tp-order__progress">{{ $t('technician.detail.checklistProgress', progress) }}</span>
    </div>
  </router-link>
</template>

<style scoped>
.tp-order { display: flex; flex-direction: column; gap: var(--op-space-2); text-decoration: none; color: inherit; border-left: 5px solid var(--op-border-strong); }
.tp-order:hover { box-shadow: var(--op-shadow-md); }
.tp-order--in_progress { border-left-color: var(--op-info); }
.tp-order--assigned { border-left-color: var(--op-brand); }
.tp-order--on_hold { border-left-color: var(--op-warn); }
.tp-order--completed, .tp-order--resolved { border-left-color: var(--op-success); }
.tp-order__number { font-size: 0.8rem; font-weight: 700; color: var(--op-text-muted); letter-spacing: 0.04em; }
.tp-order__title { font-size: 1.05rem; color: var(--op-text-strong); line-height: 1.3; }
.tp-order__progress { font-size: 0.85rem; color: var(--op-text-muted); font-weight: 600; }
</style>
