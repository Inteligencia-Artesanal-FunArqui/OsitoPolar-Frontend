<script>
import TechnicianOrderCard from '../components/technician-order-card.component.vue';
import service from '../services/technician-portal.service.js';

const FILTERS = ['all', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled'];

/** @component TechnicianOrdersPage - "Mis órdenes": own work orders with a status filter (kept in ?status=). */
export default {
  name: 'TechnicianOrdersPage',
  components: { TechnicianOrderCard },
  data() { return { orders: [], loading: true, failed: false, filter: FILTERS.includes(this.$route.query.status) ? this.$route.query.status : 'all' }; },
  computed: {
    options() { return FILTERS.map(value => ({ value, label: value === 'all' ? this.$t('technician.orders.all') : this.$t(`badge.workOrderStatus.${value}`) })); }
  },
  mounted() { this.load(); },
  methods: {
    async load() {
      this.loading = true; this.failed = false;
      try { this.orders = await service.getWorkOrders(this.filter); } catch { this.failed = true; } finally { this.loading = false; }
    },
    pick(value) {
      this.filter = value;
      this.$router.replace({ query: value === 'all' ? {} : { status: value } });
    }
  },
  watch: { filter() { this.load(); } }
};
</script>

<template>
  <div>
    <div class="tp-page-head">
      <h1>{{ $t('technician.orders.title') }}</h1>
      <p>{{ $t('technician.orders.subtitle') }}</p>
    </div>

    <div class="filters" role="group" :aria-label="$t('technician.orders.filterLabel')">
      <button v-for="o in options" :key="o.value" type="button" class="filter" :class="{ 'is-on': filter === o.value }" :aria-pressed="filter === o.value" @click="pick(o.value)">{{ o.label }}</button>
    </div>

    <op-loading-state v-if="loading" :label="$t('technician.common.loading')" />
    <op-error-state v-else-if="failed" :title="$t('technician.common.errorTitle')" :message="$t('technician.common.errorMessage')" @retry="load" />
    <op-empty-state v-else-if="!orders.length" icon="pi pi-clipboard" :title="$t('technician.orders.emptyTitle')" :message="$t('technician.orders.emptyMessage')" />
    <div v-else class="tp-grid"><technician-order-card v-for="o in orders" :key="o.id" :order="o" /></div>
  </div>
</template>

<style scoped>
.filters { display: flex; gap: var(--op-space-2); overflow-x: auto; padding-bottom: var(--op-space-2); margin-bottom: var(--op-space-3); }
.filter { flex: 0 0 auto; min-height: 44px; padding: 0 var(--op-space-4); border-radius: var(--op-radius-pill); border: 1px solid var(--op-border-strong); background: var(--op-surface); color: var(--op-text); font: inherit; font-weight: 600; cursor: pointer; }
.filter.is-on { background: var(--op-brand-strong); border-color: var(--op-brand-strong); color: #fff; }
</style>
