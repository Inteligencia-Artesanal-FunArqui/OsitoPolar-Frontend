<script>
import TechnicianOrderCard from '../components/technician-order-card.component.vue';
import service from '../services/technician-portal.service.js';

/** @component TechnicianTodayPage - "Mi jornada": what is due today, counters, rating and the next visit. */
export default {
  name: 'TechnicianTodayPage',
  components: { TechnicianOrderCard },
  data() { return { data: null, loading: true, failed: false, statuses: ['assigned', 'in_progress', 'on_hold', 'completed', 'cancelled'] }; },
  mounted() { this.load(); },
  methods: {
    async load() {
      this.loading = true; this.failed = false;
      try { this.data = await service.getDashboard(); } catch { this.failed = true; } finally { this.loading = false; }
    }
  }
};
</script>

<template>
  <div>
    <op-loading-state v-if="loading" :label="$t('technician.common.loading')" />
    <op-error-state v-else-if="failed" :title="$t('technician.common.errorTitle')" :message="$t('technician.common.errorMessage')" @retry="load" />
    <template v-else-if="data">
      <div class="tp-page-head">
        <h1>{{ $t('technician.today.greeting', { name: data.technician.name }) }}</h1>
        <p>{{ $t('technician.today.subtitle') }}</p>
      </div>

      <div class="kpis">
        <div class="tp-card kpi"><span class="kpi__value">{{ data.today.length }}</span><span class="kpi__label">{{ $t('technician.today.dueToday') }}</span></div>
        <div class="tp-card kpi"><span class="kpi__value">{{ data.completedThisMonth }}</span><span class="kpi__label">{{ $t('technician.today.completedMonth') }}</span></div>
        <div class="tp-card kpi"><span class="kpi__value"><i class="pi pi-star-fill" aria-hidden="true"></i> {{ data.rating.toFixed(1) }}</span><span class="kpi__label">{{ $t('technician.today.rating') }}</span></div>
      </div>

      <h2 class="tp-section-title">{{ $t('technician.today.dueToday') }}</h2>
      <op-empty-state v-if="!data.today.length" icon="pi pi-check-circle" :title="$t('technician.today.nothingToday')" :message="$t('technician.today.nothingTodayMessage')" />
      <div v-else class="tp-grid"><technician-order-card v-for="o in data.today" :key="o.id" :order="o" /></div>

      <h2 class="tp-section-title">{{ $t('technician.today.nextVisit') }}</h2>
      <technician-order-card v-if="data.nextVisit" :order="data.nextVisit" />
      <p v-else class="muted">{{ $t('technician.today.noNextVisit') }}</p>

      <h2 class="tp-section-title">{{ $t('technician.today.byStatus') }}</h2>
      <div class="chips">
        <router-link v-for="s in statuses" :key="s" :to="{ name: 'technician-orders', query: { status: s } }" class="chip">
          <strong>{{ data.counts[s] }}</strong> <op-status-badge kind="workOrderStatus" :value="s" />
        </router-link>
      </div>
    </template>
  </div>
</template>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--op-space-3); }
.kpi { display: flex; flex-direction: column; align-items: center; text-align: center; padding: var(--op-space-3); }
.kpi__value { font-size: 1.7rem; font-weight: 800; color: var(--op-brand-strong); line-height: 1.2; }
.kpi__value i { color: var(--op-warn); font-size: 1.2rem; }
.kpi__label { font-size: 0.78rem; color: var(--op-text-muted); font-weight: 600; }
.muted { color: var(--op-text-muted); }
.chips { display: flex; flex-wrap: wrap; gap: var(--op-space-2); }
.chip { display: inline-flex; align-items: center; gap: var(--op-space-2); min-height: 44px; padding: 0 var(--op-space-3); border: 1px solid var(--op-border); border-radius: var(--op-radius-pill); background: var(--op-surface); text-decoration: none; color: var(--op-text-strong); }
</style>
